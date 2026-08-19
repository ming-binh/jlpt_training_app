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

/**
 * Performs vector similarity search across grammar_point, vocabulary, and kanji tables
 * using pgvector's cosine distance operator (<=>).
 *
 * Uses JdbcTemplate with native SQL because Hibernate/JPA does not natively support
 * the pgvector <=> operator.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VectorSearchService {

    private final JdbcTemplate jdbcTemplate;

    @Value("${rag.top-k:3}")
    private int defaultTopK;

    /**
     * Searches for the most relevant JLPT knowledge entries matching the query vector.
     *
     * @param queryVector embedding of the user's message (768-dim)
     * @param jlptLevel   filter by JLPT level (e.g. "N5"), or null for all levels
     * @param topK        number of results to return total across all content types
     * @return list of RagDocument sorted by similarity descending
     */
    public List<RagDocument> search(float[] queryVector, String jlptLevel, int topK) {
        if (queryVector == null || queryVector.length == 0) return List.of();

        String vectorLiteral = toVectorLiteral(queryVector);

        List<RagDocument> results = new ArrayList<>();
        results.addAll(searchGrammar(vectorLiteral, jlptLevel, topK));
        results.addAll(searchVocabulary(vectorLiteral, jlptLevel, topK));
        results.addAll(searchKanji(vectorLiteral, jlptLevel, topK));

        // Sort all results by similarity descending and take global top-K
        results.sort(Comparator.comparingDouble(RagDocument::similarity).reversed());
        List<RagDocument> topResults = results.subList(0, Math.min(topK, results.size()));

        log.debug("VectorSearch: query returned {} docs (topK={})", topResults.size(), topK);
        return topResults;
    }

    /** Overload with default topK from config. */
    public List<RagDocument> search(float[] queryVector, String jlptLevel) {
        return search(queryVector, jlptLevel, defaultTopK);
    }

    // ---- Per-table search queries ----

    private List<RagDocument> searchGrammar(String vectorLiteral, String jlptLevel, int limit) {
        String sql = """
                SELECT title,
                       COALESCE(meaning, '') || CASE WHEN structure IS NOT NULL THEN ' | Cấu trúc: ' || structure ELSE '' END
                           || CASE WHEN examples IS NOT NULL THEN ' | Ví dụ: ' || examples ELSE '' END AS content,
                       1 - (embedding <=> ?::vector) AS similarity
                FROM grammar_point
                WHERE embedding IS NOT NULL
                  AND (? IS NULL OR UPPER(jlpt_level) = UPPER(?))
                ORDER BY embedding <=> ?::vector
                LIMIT ?
                """;
        try {
            return jdbcTemplate.query(sql,
                    (rs, rowNum) -> new RagDocument(
                            "GRAMMAR",
                            rs.getString("title"),
                            rs.getString("content"),
                            rs.getDouble("similarity")),
                    vectorLiteral, jlptLevel, jlptLevel, vectorLiteral, limit);
        } catch (Exception e) {
            log.warn("VectorSearch grammar query failed: {}", e.getMessage());
            return List.of();
        }
    }

    private List<RagDocument> searchVocabulary(String vectorLiteral, String jlptLevel, int limit) {
        String sql = """
                SELECT word AS title,
                       COALESCE(reading, word) || ' — ' || COALESCE(meaning, '')
                           || CASE WHEN part_of_speech IS NOT NULL THEN ' (' || part_of_speech || ')' ELSE '' END AS content,
                       1 - (embedding <=> ?::vector) AS similarity
                FROM vocabulary
                WHERE embedding IS NOT NULL
                  AND (? IS NULL OR UPPER(jlpt_level) = UPPER(?))
                ORDER BY embedding <=> ?::vector
                LIMIT ?
                """;
        try {
            return jdbcTemplate.query(sql,
                    (rs, rowNum) -> new RagDocument(
                            "VOCABULARY",
                            rs.getString("title"),
                            rs.getString("content"),
                            rs.getDouble("similarity")),
                    vectorLiteral, jlptLevel, jlptLevel, vectorLiteral, limit);
        } catch (Exception e) {
            log.warn("VectorSearch vocabulary query failed: {}", e.getMessage());
            return List.of();
        }
    }

    private List<RagDocument> searchKanji(String vectorLiteral, String jlptLevel, int limit) {
        String sql = """
                SELECT character AS title,
                       COALESCE(meanings, '') || ' | On: ' || COALESCE(on_readings, '') || ' | Kun: ' || COALESCE(kun_readings, '') AS content,
                       1 - (embedding <=> ?::vector) AS similarity
                FROM kanji
                WHERE embedding IS NOT NULL
                  AND (? IS NULL OR UPPER(jlpt_level) = UPPER(?))
                ORDER BY embedding <=> ?::vector
                LIMIT ?
                """;
        try {
            return jdbcTemplate.query(sql,
                    (rs, rowNum) -> new RagDocument(
                            "KANJI",
                            rs.getString("title"),
                            rs.getString("content"),
                            rs.getDouble("similarity")),
                    vectorLiteral, jlptLevel, jlptLevel, vectorLiteral, limit);
        } catch (Exception e) {
            log.warn("VectorSearch kanji query failed: {}", e.getMessage());
            return List.of();
        }
    }

    // ---- Utility ----

    /**
     * Converts a float[] to the pgvector literal format: '[0.1,0.2,...]'
     */
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
