package com.jlpt.tutor.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jlpt.tutor.entity.GrammarPoint;
import com.jlpt.tutor.entity.Kanji;
import com.jlpt.tutor.entity.Vocabulary;
import com.jlpt.tutor.repository.GrammarPointRepository;
import com.jlpt.tutor.repository.KanjiRepository;
import com.jlpt.tutor.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import org.springframework.jdbc.core.JdbcTemplate;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class JlptDataSyncService {

    private final JlptVocabApiClient vocabApiClient;
    private final KanjiApiClient kanjiApiClient;
    private final GrammarPointRepository grammarPointRepository;
    private final VocabularyRepository vocabularyRepository;
    private final KanjiRepository kanjiRepository;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void syncOnStartup() {
        log.info("=== JLPT Data Sync: Starting ===");

        // 0. Ensure column types are TEXT in PostgreSQL
        try {
            jdbcTemplate.execute("ALTER TABLE grammar_point ALTER COLUMN structure TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE grammar_point ALTER COLUMN meaning TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE grammar_point ALTER COLUMN related_grammar TYPE TEXT");
        } catch (Exception e) {
            log.debug("Column alter note: {}", e.getMessage());
        }

        // 1. Seed grammar from local JSON files
        seedGrammar();

        // 2. Sync vocabulary: load full 3,093 items from API if empty, then overlay Vietnamese meanings
        if (vocabularyRepository.count() == 0) {
            log.info("Vocabulary table is empty. Syncing full dataset from external API for N5, N4, N3...");
            for (String level : List.of("N5", "N4", "N3")) {
                vocabApiClient.syncVocabulary(level);
            }
        }
        seedLocalVocab();

        // 3. Sync kanji: load full dataset from API if empty, then overlay Vietnamese meanings
        if (kanjiRepository.count() == 0) {
            log.info("Kanji table is empty. Syncing full dataset from external API for N5, N4, N3...");
            for (String level : List.of("N5", "N4", "N3")) {
                kanjiApiClient.syncKanji(level);
            }
        }
        seedLocalKanji();

        log.info("=== JLPT Data Sync: Complete ===");
        log.info("Stats: Vocabulary={}, Kanji={}, Grammar={}",
                vocabularyRepository.count(), kanjiRepository.count(), grammarPointRepository.count());
    }

    /**
     * Force sync all N5, N4, N3 data from live open APIs and local resources.
     */
    public Map<String, Object> forceSyncAll() {
        log.info("=== Force Syncing All JLPT Data N5-N3 from Live APIs ===");
        
        seedGrammar();

        int vocabCount = 0;
        if (vocabularyRepository.count() == 0) {
            for (String level : List.of("N5", "N4", "N3")) {
                vocabCount += vocabApiClient.syncVocabulary(level);
            }
        }
        seedLocalVocab();

        int kanjiCount = 0;
        if (kanjiRepository.count() == 0) {
            for (String level : List.of("N5", "N4", "N3")) {
                kanjiCount += kanjiApiClient.syncKanji(level);
            }
        }
        seedLocalKanji();

        return Map.of(
            "status", "success",
            "newVocabSynced", vocabCount,
            "newKanjiSynced", kanjiCount,
            "totalVocabulary", vocabularyRepository.count(),
            "totalKanji", kanjiRepository.count(),
            "totalGrammar", grammarPointRepository.count()
        );
    }

    public Map<String, Object> syncGrammar() {
        int newlyAdded = seedGrammar();
        return Map.of(
            "status", "success",
            "newGrammarSynced", newlyAdded,
            "totalGrammar", grammarPointRepository.count()
        );
    }

    private int seedGrammar() {
        int newlyAdded = 0;
        for (String level : List.of("n5", "n4", "n3", "n2", "n1")) {
            String filename = "data/grammar_" + level + ".json";
            try {
                ClassPathResource resource = new ClassPathResource(filename);
                if (!resource.exists()) continue;

                InputStream is = resource.getInputStream();
                List<Map<String, String>> entries = objectMapper.readValue(is, new TypeReference<>() {});

                String upperLevel = level.toUpperCase();
                List<GrammarPoint> existingList = grammarPointRepository.findByJlptLevelIgnoreCase(upperLevel);
                Map<String, GrammarPoint> existingMap = new HashMap<>();
                for (GrammarPoint gp : existingList) {
                    if (gp.getTitle() != null) {
                        existingMap.put(normalizeGrammarTitle(gp.getTitle()), gp);
                    }
                }

                List<GrammarPoint> toSave = new ArrayList<>();
                for (Map<String, String> e : entries) {
                    String title = e.getOrDefault("title", "").trim();
                    if (title.isBlank()) continue;

                    String normTitle = normalizeGrammarTitle(title);
                    GrammarPoint existing = existingMap.get(normTitle);

                    if (existing != null) {
                        boolean modified = false;
                        if ((existing.getStructure() == null || existing.getStructure().isBlank()) && e.containsKey("structure")) {
                            existing.setStructure(e.get("structure"));
                            modified = true;
                        }
                        if ((existing.getMeaning() == null || existing.getMeaning().isBlank()) && e.containsKey("meaning")) {
                            existing.setMeaning(e.get("meaning"));
                            modified = true;
                        }
                        if ((existing.getExamples() == null || existing.getExamples().isBlank() || "[]".equals(existing.getExamples())) && e.containsKey("examples")) {
                            existing.setExamples(e.get("examples"));
                            modified = true;
                        }
                        if (modified) {
                            toSave.add(existing);
                        }
                    } else {
                        GrammarPoint newGp = GrammarPoint.builder()
                                .title(title)
                                .structure(e.getOrDefault("structure", ""))
                                .meaning(e.getOrDefault("meaning", ""))
                                .jlptLevel(upperLevel)
                                .examples(e.getOrDefault("examples", "[]"))
                                .relatedGrammar(e.getOrDefault("relatedGrammar", ""))
                                .build();
                        toSave.add(newGp);
                        existingMap.put(normTitle, newGp);
                        newlyAdded++;
                    }
                }

                if (!toSave.isEmpty()) {
                    grammarPointRepository.saveAll(toSave);
                    log.info("Level {}: Saved {} grammar points (new/updated) from {}", upperLevel, toSave.size(), filename);
                }

            } catch (Exception e) {
                log.error("Failed to seed grammar from {}: {}", filename, e.getMessage());
            }
        }
        return newlyAdded;
    }

    private String normalizeGrammarTitle(String title) {
        if (title == null) return "";
        return title.replace("～", "〜").replace("~", "〜").replaceAll("\\s+", "").toLowerCase();
    }

    private void seedLocalVocab() {
        for (String level : List.of("n5", "n4", "n3")) {
            String filename = "data/vocab_" + level + ".json";
            try {
                ClassPathResource resource = new ClassPathResource(filename);
                if (!resource.exists()) continue;

                InputStream is = resource.getInputStream();
                List<Vocabulary> vocabList = objectMapper.readValue(is, new TypeReference<>() {});
                for (Vocabulary v : vocabList) {
                    vocabularyRepository.findFirstByWord(v.getWord())
                        .ifPresentOrElse(existing -> {
                            existing.setMeaning(v.getMeaning());
                            existing.setReading(v.getReading());
                            existing.setRomaji(v.getRomaji());
                            vocabularyRepository.save(existing);
                        }, () -> vocabularyRepository.save(v));
                }
                log.info("Seeded/Updated local Vietnamese vocabulary from {}", filename);
            } catch (Exception e) {
                log.error("Failed to seed local vocabulary from {}: {}", filename, e.getMessage());
            }
        }
    }

    private void seedLocalKanji() {
        for (String level : List.of("n5", "n4", "n3")) {
            String filename = "data/kanji_" + level + ".json";
            try {
                ClassPathResource resource = new ClassPathResource(filename);
                if (!resource.exists()) continue;

                InputStream is = resource.getInputStream();
                List<Kanji> kanjiList = objectMapper.readValue(is, new TypeReference<>() {});
                for (Kanji k : kanjiList) {
                    kanjiRepository.findByCharacter(k.getCharacter())
                        .ifPresentOrElse(existing -> {
                            existing.setMeanings(k.getMeanings());
                            existing.setKunReadings(k.getKunReadings());
                            existing.setOnReadings(k.getOnReadings());
                            kanjiRepository.save(existing);
                        }, () -> kanjiRepository.save(k));
                }
                log.info("Seeded/Updated local Vietnamese kanji from {}", filename);
            } catch (Exception e) {
                log.error("Failed to seed local kanji from {}: {}", filename, e.getMessage());
            }
        }
    }
}
