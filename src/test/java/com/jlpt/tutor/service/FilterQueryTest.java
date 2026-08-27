package com.jlpt.tutor.service;

import com.jlpt.tutor.entity.GrammarPoint;
import com.jlpt.tutor.entity.Kanji;
import com.jlpt.tutor.entity.UserProgress;
import com.jlpt.tutor.entity.Vocabulary;
import com.jlpt.tutor.repository.GrammarPointRepository;
import com.jlpt.tutor.repository.KanjiRepository;
import com.jlpt.tutor.repository.UserProgressRepository;
import com.jlpt.tutor.repository.VocabularyRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("prod")
public class FilterQueryTest {

    @Autowired
    private VocabularyRepository vocabularyRepository;

    @Autowired
    private KanjiRepository kanjiRepository;

    @Autowired
    private GrammarPointRepository grammarPointRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private JlptLevelConfigService levelConfigService;

    @Test
    public void testFilters() {
        List<String> activeLevels = levelConfigService.getActiveLevelCodes();
        System.out.println("Active levels: " + activeLevels);

        // 1. Test Vocab level filtering
        for (String lvl : List.of("N5", "N4", "N3")) {
            Page<Vocabulary> vPage = vocabularyRepository.searchVocabulary(
                    lvl, activeLevels, null, UserProgress.EntityType.VOCABULARY, null, UserProgress.ProgressStatus.NEW, false, null, PageRequest.of(0, 5));
            System.out.println("Vocab " + lvl + " count: " + vPage.getTotalElements());
            assertTrue(vPage.getTotalElements() > 0);
        }

        // 2. Test Kanji level filtering
        for (String lvl : List.of("N5", "N4", "N3")) {
            Page<Kanji> kPage = kanjiRepository.searchKanji(
                    lvl, activeLevels, null, UserProgress.EntityType.KANJI, null, UserProgress.ProgressStatus.NEW, false, null, PageRequest.of(0, 5));
            System.out.println("Kanji " + lvl + " count: " + kPage.getTotalElements());
            assertTrue(kPage.getTotalElements() > 0);
        }

        // 3. Test Grammar level filtering
        for (String lvl : List.of("N5", "N4", "N3")) {
            Page<GrammarPoint> gPage = grammarPointRepository.searchGrammar(
                    lvl, activeLevels, null, UserProgress.EntityType.GRAMMAR, null, UserProgress.ProgressStatus.NEW, false, null, PageRequest.of(0, 5));
            System.out.println("Grammar " + lvl + " count: " + gPage.getTotalElements());
            assertTrue(gPage.getTotalElements() > 0);
        }

        // 4. Test status filtering with user progress
        String testUserId = "test-user-filter-123";
        Vocabulary sampleVocab = vocabularyRepository.findAll().stream()
                .filter(v -> "N4".equalsIgnoreCase(v.getJlptLevel()))
                .findFirst().orElse(null);

        if (sampleVocab != null) {
            userProgressRepository.findByUserIdAndEntityTypeAndEntityId(
                    testUserId, UserProgress.EntityType.VOCABULARY, sampleVocab.getId())
                    .ifPresent(userProgressRepository::delete);

            userProgressRepository.save(UserProgress.builder()
                    .userId(testUserId)
                    .entityType(UserProgress.EntityType.VOCABULARY)
                    .entityId(sampleVocab.getId())
                    .status(UserProgress.ProgressStatus.MASTERED)
                    .build());
        }

        // Search MASTERED for N4
        Page<Vocabulary> mastered = vocabularyRepository.searchVocabulary(
                "N4", activeLevels, null, UserProgress.EntityType.VOCABULARY,
                UserProgress.ProgressStatus.MASTERED, UserProgress.ProgressStatus.NEW, false, testUserId, PageRequest.of(0, 10));
        System.out.println("Vocab N4 MASTERED count: " + mastered.getTotalElements());
        assertTrue(mastered.getTotalElements() >= 1);

        // Search NEW for N4
        Page<Vocabulary> newItems = vocabularyRepository.searchVocabulary(
                "N4", activeLevels, null, UserProgress.EntityType.VOCABULARY,
                null, UserProgress.ProgressStatus.NEW, true, testUserId, PageRequest.of(0, 10));
        System.out.println("Vocab N4 NEW count: " + newItems.getTotalElements());
        assertTrue(newItems.getTotalElements() > 0);

        // Search LEARNING for N4 (should be 0)
        Page<Vocabulary> learning = vocabularyRepository.searchVocabulary(
                "N4", activeLevels, null, UserProgress.EntityType.VOCABULARY,
                UserProgress.ProgressStatus.LEARNING, UserProgress.ProgressStatus.NEW, false, testUserId, PageRequest.of(0, 10));
        System.out.println("Vocab N4 LEARNING count: " + learning.getTotalElements());

        // Guest user test (userId == null)
        Page<Vocabulary> guestAll = vocabularyRepository.searchVocabulary(
                "N4", activeLevels, null, UserProgress.EntityType.VOCABULARY,
                null, UserProgress.ProgressStatus.NEW, false, null, PageRequest.of(0, 10));
        System.out.println("Vocab N4 Guest (ALL status) count: " + guestAll.getTotalElements());

        Page<Vocabulary> guestNew = vocabularyRepository.searchVocabulary(
                "N4", activeLevels, null, UserProgress.EntityType.VOCABULARY,
                null, UserProgress.ProgressStatus.NEW, true, null, PageRequest.of(0, 10));
        System.out.println("Vocab N4 Guest (NEW status) count: " + guestNew.getTotalElements());

        Page<Vocabulary> guestMastered = vocabularyRepository.searchVocabulary(
                "N4", activeLevels, null, UserProgress.EntityType.VOCABULARY,
                UserProgress.ProgressStatus.MASTERED, UserProgress.ProgressStatus.NEW, false, null, PageRequest.of(0, 10));
        System.out.println("Vocab N4 Guest (MASTERED status) count: " + guestMastered.getTotalElements());
    }
}
