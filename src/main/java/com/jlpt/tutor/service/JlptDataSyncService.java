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

        // 2. Seed Vietnamese vocabulary from local JSON files (Primary source)
        seedLocalVocab();

        // 3. Seed Vietnamese kanji from local JSON files (Primary source)
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
        
        // Seed Grammar
        seedGrammar();
        seedLocalVocab();
        seedLocalKanji();

        return Map.of(
            "status", "success",
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
                    if (v.getMeaningVi() == null || v.getMeaningVi().isBlank()) {
                        v.setMeaningVi(v.getMeaning());
                    }
                    vocabularyRepository.findFirstByWord(v.getWord())
                        .ifPresentOrElse(existing -> {
                            existing.setMeaning(v.getMeaning());
                            existing.setMeaningVi(v.getMeaning());
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
                    if (k.getMeaningsVi() == null || k.getMeaningsVi().isBlank()) {
                        k.setMeaningsVi(k.getMeanings());
                    }
                    kanjiRepository.findByCharacter(k.getCharacter())
                        .ifPresentOrElse(existing -> {
                            existing.setMeanings(k.getMeanings());
                            existing.setMeaningsVi(k.getMeanings());
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
