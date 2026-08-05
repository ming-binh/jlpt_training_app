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

import java.io.InputStream;
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

    @EventListener(ApplicationReadyEvent.class)
    public void syncOnStartup() {
        log.info("=== JLPT Data Sync: Starting ===");

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

    private void seedGrammar() {
        if (grammarPointRepository.count() > 0) {
            log.info("Grammar table already has {} entries. Skipping seed.", grammarPointRepository.count());
            return;
        }

        for (String level : List.of("n5", "n4", "n3")) {
            String filename = "data/grammar_" + level + ".json";
            try {
                ClassPathResource resource = new ClassPathResource(filename);
                if (!resource.exists()) continue;

                InputStream is = resource.getInputStream();
                List<Map<String, String>> entries = objectMapper.readValue(is, new TypeReference<>() {});

                List<GrammarPoint> points = entries.stream()
                        .map(e -> GrammarPoint.builder()
                                .title(e.getOrDefault("title", ""))
                                .structure(e.getOrDefault("structure", ""))
                                .meaning(e.getOrDefault("meaning", ""))
                                .jlptLevel(level.toUpperCase())
                                .examples(e.getOrDefault("examples", ""))
                                .relatedGrammar(e.getOrDefault("relatedGrammar", ""))
                                .build())
                        .toList();

                grammarPointRepository.saveAll(points);
                log.info("Seeded {} grammar points from {}", points.size(), filename);

            } catch (Exception e) {
                log.error("Failed to seed grammar from {}: {}", filename, e.getMessage());
            }
        }
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
