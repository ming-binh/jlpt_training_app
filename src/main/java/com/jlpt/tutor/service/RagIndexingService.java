package com.jlpt.tutor.service;

import com.jlpt.tutor.entity.GrammarPoint;
import com.jlpt.tutor.entity.Kanji;
import com.jlpt.tutor.entity.Vocabulary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Batch service that generates embeddings for all JLPT content entries
 * and stores them in the database for RAG vector search.
 *
 * Uses batchEmbedContents (100 texts per API call) for high throughput.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RagIndexingService {

    private final EmbeddingService embeddingService;
    private final JdbcTemplate jdbcTemplate;


    /** Number of texts sent per Jina AI API call (Jina supports up to 2048). */
    private static final int BATCH_SIZE = 500;

    /** Delay between batch API calls in ms (500ms is fast and safe for Jina). */
    private static final long BATCH_DELAY_MS = 500;

    /**
     * Index all content types.
     * @param force If true, re-indexes even already embedded rows.
     */
    public IndexingResult indexAll(boolean force) {
        log.info("RAG indexing: starting full index (force={})", force);
        IndexingResult grammar = indexGrammar(force);
        IndexingResult vocab = indexVocabulary(force);
        IndexingResult kanji = indexKanji(force);
        IndexingResult total = grammar.merge(vocab).merge(kanji);
        log.info("RAG indexing: complete — indexed={}, skipped={}, failed={}",
                total.indexed(), total.skipped(), total.failed());
        return total;
    }

    public IndexingResult indexAll() {
        return indexAll(false);
    }

    public IndexingResult indexGrammar() {
        return indexGrammar(false);
    }

    public IndexingResult indexGrammar(boolean force) {
        log.info("RAG indexing: grammar_point (force={})", force);
        List<GrammarPoint> items = fetchGrammar(force);
        if (items.isEmpty()) {
            log.info("Grammar: nothing to index");
            return new IndexingResult(0, 0, 0);
        }
        IndexingResult result = indexInBatches(
                items.stream().map(g -> new IdAndText(g.getId(), buildGrammarText(g))).toList(),
                "grammar_point"
        );
        log.info("Grammar indexed={}, failed={}", result.indexed(), result.failed());
        return result;
    }

    public IndexingResult indexVocabulary() {
        return indexVocabulary(false);
    }

    public IndexingResult indexVocabulary(boolean force) {
        log.info("RAG indexing: vocabulary (force={})", force);
        List<Vocabulary> items = fetchVocab(force);
        if (items.isEmpty()) {
            log.info("Vocabulary: nothing to index");
            return new IndexingResult(0, 0, 0);
        }
        IndexingResult result = indexInBatches(
                items.stream().map(v -> new IdAndText(v.getId(), buildVocabText(v))).toList(),
                "vocabulary"
        );
        log.info("Vocabulary indexed={}, failed={}", result.indexed(), result.failed());
        return result;
    }

    public IndexingResult indexKanji() {
        return indexKanji(false);
    }

    public IndexingResult indexKanji(boolean force) {
        log.info("RAG indexing: kanji (force={})", force);
        List<Kanji> items = fetchKanji(force);
        if (items.isEmpty()) {
            log.info("Kanji: nothing to index");
            return new IndexingResult(0, 0, 0);
        }
        IndexingResult result = indexInBatches(
                items.stream().map(k -> new IdAndText(k.getId(), buildKanjiText(k))).toList(),
                "kanji"
        );
        log.info("Kanji indexed={}, failed={}", result.indexed(), result.failed());
        return result;
    }

    /**
     * Processes items in batches of BATCH_SIZE, calling batchEmbedContents once per batch.
     */
    private IndexingResult indexInBatches(List<IdAndText> items, String tableName) {
        int indexed = 0, failed = 0;
        int totalBatches = (int) Math.ceil((double) items.size() / BATCH_SIZE);

        for (int batchNum = 0; batchNum < totalBatches; batchNum++) {
            int from = batchNum * BATCH_SIZE;
            int to = Math.min(from + BATCH_SIZE, items.size());
            List<IdAndText> batch = items.subList(from, to);

            log.info("[{}/{}] Embedding batch of {} items in {}...",
                    batchNum + 1, totalBatches, batch.size(), tableName);

            List<String> texts = batch.stream().map(IdAndText::text).toList();
            List<float[]> vectors = embeddingService.embedBatch(texts);

            for (int i = 0; i < batch.size(); i++) {
                float[] vector = (i < vectors.size()) ? vectors.get(i) : null;
                if (vector != null) {
                    updateEmbedding(tableName, batch.get(i).id(), vector);
                    indexed++;
                } else {
                    failed++;
                    log.warn("  Item id={} in {} failed to embed", batch.get(i).id(), tableName);
                }
            }

            if (batchNum < totalBatches - 1) {
                batchSleep();
            }
        }

        return new IndexingResult(indexed, 0, failed);
    }

    // ---- Status queries ----

    public IndexingStatus getStatus() {
        long grammarTotal   = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM grammar_point", Long.class);
        long grammarIndexed = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM grammar_point WHERE embedding IS NOT NULL", Long.class);
        long vocabTotal     = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM vocabulary", Long.class);
        long vocabIndexed   = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM vocabulary WHERE embedding IS NOT NULL", Long.class);
        long kanjiTotal     = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM kanji", Long.class);
        long kanjiIndexed   = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM kanji WHERE embedding IS NOT NULL", Long.class);
        return new IndexingStatus(grammarTotal, grammarIndexed, vocabTotal, vocabIndexed, kanjiTotal, kanjiIndexed);
    }

    // ---- Text builders ----

    private String buildGrammarText(GrammarPoint g) {
        StringBuilder sb = new StringBuilder(g.getTitle());
        if (g.getStructure() != null)      sb.append(' ').append(g.getStructure());
        if (g.getMeaning() != null)        sb.append(' ').append(g.getMeaning());
        if (g.getExamples() != null)       sb.append(' ').append(g.getExamples());
        if (g.getRelatedGrammar() != null) sb.append(' ').append(g.getRelatedGrammar());
        return sb.toString().strip();
    }

    private String buildVocabText(Vocabulary v) {
        StringBuilder sb = new StringBuilder(v.getWord());
        if (v.getReading() != null)      sb.append(' ').append(v.getReading());
        if (v.getMeaning() != null)      sb.append(' ').append(v.getMeaning());
        if (v.getRomaji() != null)       sb.append(' ').append(v.getRomaji());
        if (v.getPartOfSpeech() != null) sb.append(' ').append(v.getPartOfSpeech());
        return sb.toString().strip();
    }

    private String buildKanjiText(Kanji k) {
        StringBuilder sb = new StringBuilder(k.getCharacter());
        if (k.getMeanings() != null)    sb.append(' ').append(k.getMeanings());
        if (k.getOnReadings() != null)  sb.append(' ').append(k.getOnReadings());
        if (k.getKunReadings() != null) sb.append(' ').append(k.getKunReadings());
        return sb.toString().strip();
    }

    // ---- DB helpers ----

    private List<GrammarPoint> fetchGrammar(boolean force) {
        String sql = force ? "SELECT * FROM grammar_point ORDER BY id"
                           : "SELECT * FROM grammar_point WHERE embedding IS NULL ORDER BY id";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            GrammarPoint g = new GrammarPoint();
            g.setId(rs.getLong("id"));
            g.setTitle(rs.getString("title"));
            g.setStructure(rs.getString("structure"));
            g.setMeaning(rs.getString("meaning"));
            g.setExamples(rs.getString("examples"));
            g.setRelatedGrammar(rs.getString("related_grammar"));
            g.setJlptLevel(rs.getString("jlpt_level"));
            return g;
        });
    }

    private List<Vocabulary> fetchVocab(boolean force) {
        String sql = force ? "SELECT * FROM vocabulary ORDER BY id"
                           : "SELECT * FROM vocabulary WHERE embedding IS NULL ORDER BY id";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Vocabulary v = new Vocabulary();
            v.setId(rs.getLong("id"));
            v.setWord(rs.getString("word"));
            v.setReading(rs.getString("reading"));
            v.setMeaning(rs.getString("meaning"));
            v.setRomaji(rs.getString("romaji"));
            v.setPartOfSpeech(rs.getString("part_of_speech"));
            v.setJlptLevel(rs.getString("jlpt_level"));
            return v;
        });
    }

    private List<Kanji> fetchKanji(boolean force) {
        String sql = force ? "SELECT * FROM kanji ORDER BY id"
                           : "SELECT * FROM kanji WHERE embedding IS NULL ORDER BY id";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Kanji k = new Kanji();
            k.setId(rs.getLong("id"));
            k.setCharacter(rs.getString("character"));
            k.setMeanings(rs.getString("meanings"));
            k.setOnReadings(rs.getString("on_readings"));
            k.setKunReadings(rs.getString("kun_readings"));
            k.setJlptLevel(rs.getString("jlpt_level"));
            return k;
        });
    }

    private void updateEmbedding(String tableName, Long id, float[] vector) {
        String vectorLiteral = toVectorLiteral(vector);
        jdbcTemplate.update(
                "UPDATE " + tableName + " SET embedding = ?::vector WHERE id = ?",
                vectorLiteral, id);
    }

    private String toVectorLiteral(float[] vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(vector[i]);
        }
        sb.append(']');
        return sb.toString();
    }

    private void batchSleep() {
        try {
            Thread.sleep(BATCH_DELAY_MS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private record IdAndText(Long id, String text) {}

    public record IndexingResult(int indexed, int skipped, int failed) {
        public IndexingResult merge(IndexingResult other) {
            return new IndexingResult(
                    this.indexed + other.indexed,
                    this.skipped + other.skipped,
                    this.failed + other.failed);
        }
    }

    public record IndexingStatus(
            long grammarTotal, long grammarIndexed,
            long vocabTotal,   long vocabIndexed,
            long kanjiTotal,   long kanjiIndexed) {

        public long totalEntries()  { return grammarTotal + vocabTotal + kanjiTotal; }
        public long totalIndexed()  { return grammarIndexed + vocabIndexed + kanjiIndexed; }
        public long totalPending()  { return totalEntries() - totalIndexed(); }
    }
}
