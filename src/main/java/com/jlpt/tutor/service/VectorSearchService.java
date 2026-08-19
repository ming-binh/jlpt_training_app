package com.jlpt.tutor.service;

import com.jlpt.tutor.model.RagDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Performs Hybrid (Keyword Exact Match + pgvector Cosine Similarity) search
 * across grammar_point, vocabulary, and kanji tables.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VectorSearchService {

    private final JdbcTemplate jdbcTemplate;

    @Value("${rag.top-k:6}")
    private int defaultTopK;

    private static final Pattern QUOTED_PATTERN = Pattern.compile("[\"'\u300c\u300e]([^\u300d\u300f\"']+)[\"'\u300d\u300f]");
    private static final Pattern JAPANESE_PATTERN = Pattern.compile("[\\u3040-\\u30ff\\u3000-\\u303f\\u4e00-\\u9faf\u301c\\uff5e]+");

    /**
     * Hybrid search using both dense vector similarity and keyword matching.
     */
    public List<RagDocument> search(float[] queryVector, String rawQuery, String jlptLevel, int topK) {
        if (queryVector == null || queryVector.length == 0) return List.of();

        String keyword = extractKeyword(rawQuery);
        String vectorLiteral = toVectorLiteral(queryVector);
        int perCategoryLimit = Math.max(2, (topK + 2) / 3);

        List<RagDocument> grammars = searchGrammar(vectorLiteral, keyword, jlptLevel, perCategoryLimit);
        List<RagDocument> vocabs = searchVocabulary(vectorLiteral, keyword, jlptLevel, perCategoryLimit);
        List<RagDocument> kanjis = searchKanji(vectorLiteral, keyword, jlptLevel, perCategoryLimit);

        List<RagDocument> results = new ArrayList<>();
        results.addAll(grammars);
        results.addAll(vocabs);
        results.addAll(kanjis);

        // Filter out very low relevance if similarity is below threshold, but keep highest
        results.removeIf(doc -> doc.similarity() < 0.35);

        // Sort all results by similarity descending
        results.sort(Comparator.comparingDouble(RagDocument::similarity).reversed());

        log.info("HybridSearch: returned {} docs (grammar={}, vocab={}, kanji={}, extractedKeyword='{}')",
                results.size(), grammars.size(), vocabs.size(), kanjis.size(), keyword);
        for (RagDocument doc : results) {
            log.info("  -> [{}] {} (sim={}): {}", doc.type(), doc.title(), String.format("%.3f", doc.similarity()), doc.content());
        }
        return results;
    }

    public List<RagDocument> search(float[] queryVector, String jlptLevel, int topK) {
        return search(queryVector, null, jlptLevel, topK);
    }

    public List<RagDocument> search(float[] queryVector, String jlptLevel) {
        return search(queryVector, null, jlptLevel, defaultTopK);
    }

    // ---- Keyword extractor ----

    private String extractKeyword(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) return null;

        // 1. Check for quoted keywords: "hồi", 'n5', 「〜ながら」
        Matcher qm = QUOTED_PATTERN.matcher(rawQuery);
        if (qm.find()) {
            return qm.group(1).trim();
        }

        // 2. Check for Japanese characters/words: 覚, 食べる, 〜ながら
        Matcher jm = JAPANESE_PATTERN.matcher(rawQuery);
        if (jm.find()) {
            return jm.group(0).trim();
        }

        // 3. Fallback: single word query under 20 chars
        String trimmed = rawQuery.trim();
        if (trimmed.length() <= 20 && !trimmed.contains(" ")) {
            return trimmed;
        }

        return null;
    }

    // ---- Per-table search queries ----

    private List<RagDocument> searchGrammar(String vectorLiteral, String keyword, String jlptLevel, int limit) {
        String sql = """
                SELECT title,
                       'Ý nghĩa: ' || COALESCE(meaning, '')
                           || CASE WHEN structure IS NOT NULL THEN ' | Cấu trúc: ' || structure ELSE '' END
                           || CASE WHEN examples IS NOT NULL THEN ' | Ví dụ: ' || examples ELSE '' END
                           || CASE WHEN jlpt_level IS NOT NULL THEN ' | Cấp độ: ' || jlpt_level ELSE '' END AS content,
                       CASE
                           WHEN ?::text IS NOT NULL AND (title ILIKE '%' || ?::text || '%' OR meaning ILIKE '%' || ?::text || '%') THEN 1.0
                           ELSE 1 - (embedding <=> ?::vector)
                       END AS similarity
                FROM grammar_point
                WHERE embedding IS NOT NULL
                  AND (?::text IS NULL OR UPPER(jlpt_level) = UPPER(?::text))
                ORDER BY (
                    CASE
                        WHEN ?::text IS NOT NULL AND (title ILIKE '%' || ?::text || '%' OR meaning ILIKE '%' || ?::text || '%') THEN 0
                        ELSE 1
                    END
                ), embedding <=> ?::vector
                LIMIT ?
                """;
        try {
            return jdbcTemplate.query(sql,
                    (rs, rowNum) -> new RagDocument(
                            "NGỮ PHÁP",
                            rs.getString("title"),
                            rs.getString("content"),
                            rs.getDouble("similarity")),
                    keyword, keyword, keyword, vectorLiteral, jlptLevel, jlptLevel, keyword, keyword, keyword, vectorLiteral, limit);
        } catch (Exception e) {
            log.error("HybridSearch grammar query failed: {}", e.getMessage());
            return List.of();
        }
    }

    private List<RagDocument> searchVocabulary(String vectorLiteral, String keyword, String jlptLevel, int limit) {
        String sql = """
                SELECT word AS title,
                       'Cách đọc: ' || COALESCE(reading, word)
                           || ' | Nghĩa: ' || COALESCE(meaning, '')
                           || CASE WHEN part_of_speech IS NOT NULL THEN ' (' || part_of_speech || ')' ELSE '' END
                           || CASE WHEN jlpt_level IS NOT NULL THEN ' | Cấp độ: ' || jlpt_level ELSE '' END AS content,
                       CASE
                           WHEN ?::text IS NOT NULL AND (word ILIKE '%' || ?::text || '%' OR reading ILIKE '%' || ?::text || '%' OR meaning ILIKE '%' || ?::text || '%') THEN 1.0
                           ELSE 1 - (embedding <=> ?::vector)
                       END AS similarity
                FROM vocabulary
                WHERE embedding IS NOT NULL
                  AND (?::text IS NULL OR UPPER(jlpt_level) = UPPER(?::text))
                ORDER BY (
                    CASE
                        WHEN ?::text IS NOT NULL AND (word ILIKE '%' || ?::text || '%' OR reading ILIKE '%' || ?::text || '%' OR meaning ILIKE '%' || ?::text || '%') THEN 0
                        ELSE 1
                    END
                ), embedding <=> ?::vector
                LIMIT ?
                """;
        try {
            return jdbcTemplate.query(sql,
                    (rs, rowNum) -> new RagDocument(
                            "TỪ VỰNG",
                            rs.getString("title"),
                            rs.getString("content"),
                            rs.getDouble("similarity")),
                    keyword, keyword, keyword, keyword, vectorLiteral, jlptLevel, jlptLevel, keyword, keyword, keyword, keyword, vectorLiteral, limit);
        } catch (Exception e) {
            log.error("HybridSearch vocabulary query failed: {}", e.getMessage());
            return List.of();
        }
    }

    private List<RagDocument> searchKanji(String vectorLiteral, String keyword, String jlptLevel, int limit) {
        String sql = """
                SELECT character AS title,
                       'Âm Hán Việt / Nghĩa: ' || COALESCE(meanings, '')
                           || ' | Âm On: ' || COALESCE(on_readings, '')
                           || ' | Âm Kun: ' || COALESCE(kun_readings, '')
                           || CASE WHEN jlpt_level IS NOT NULL THEN ' | Cấp độ: ' || jlpt_level ELSE '' END AS content,
                       CASE
                           WHEN ?::text IS NOT NULL AND (character = ?::text OR meanings ILIKE '%' || ?::text || '%') THEN 1.0
                           ELSE 1 - (embedding <=> ?::vector)
                       END AS similarity
                FROM kanji
                WHERE embedding IS NOT NULL
                  AND (?::text IS NULL OR UPPER(jlpt_level) = UPPER(?::text))
                ORDER BY (
                    CASE
                        WHEN ?::text IS NOT NULL AND (character = ?::text OR meanings ILIKE '%' || ?::text || '%') THEN 0
                        ELSE 1
                    END
                ), embedding <=> ?::vector
                LIMIT ?
                """;
        try {
            return jdbcTemplate.query(sql,
                    (rs, rowNum) -> new RagDocument(
                            "KANJI",
                            rs.getString("title"),
                            rs.getString("content"),
                            rs.getDouble("similarity")),
                    keyword, keyword, keyword, vectorLiteral, jlptLevel, jlptLevel, keyword, keyword, keyword, vectorLiteral, limit);
        } catch (Exception e) {
            log.error("HybridSearch kanji query failed: {}", e.getMessage());
            return List.of();
        }
    }

    // ---- Utility ----

    private String toVectorLiteral(float[] vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(vector[i]);
        }
        sb.append(']');
        return sb.toString();
    }
}
