package com.jlpt.tutor.service;

import com.jlpt.tutor.dto.ExerciseDto;
import com.jlpt.tutor.entity.GrammarPoint;
import com.jlpt.tutor.entity.Kanji;
import com.jlpt.tutor.entity.LessonItem;
import com.jlpt.tutor.entity.UserProgress;
import com.jlpt.tutor.entity.Vocabulary;
import com.jlpt.tutor.repository.GrammarPointRepository;
import com.jlpt.tutor.repository.KanjiRepository;
import com.jlpt.tutor.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Builds ExerciseDto objects from Vocabulary/Kanji/GrammarPoint entities.
 * Shared by lesson exercises, practice quiz, and SRS review — so the same
 * flashcard/multiple_choice rendering rules apply everywhere.
 */
@Service
@RequiredArgsConstructor
public class ExerciseGeneratorService {

    private final VocabularyRepository vocabularyRepository;
    private final KanjiRepository kanjiRepository;
    private final GrammarPointRepository grammarPointRepository;

    /** Flashcard + multiple_choice per vocab item, flashcard-only for kanji/grammar — used by lessons. */
    public List<ExerciseDto> generateForItems(List<LessonItem> items) {
        List<ExerciseDto> exercises = new ArrayList<>();
        List<Vocabulary> allVocabs = vocabularyRepository.findAll();

        for (LessonItem item : items) {
            switch (item.getEntityType()) {
                case VOCABULARY -> vocabularyRepository.findById(item.getEntityId()).ifPresent(v -> {
                    exercises.add(buildVocabFlashcard(v));
                    // Skip multiple_choice if this word's own meaning was never translated —
                    // an English "correct answer" next to Vietnamese distractors reads as broken.
                    if (!isEnglish(v.getDisplayMeaning())) {
                        exercises.add(buildVocabMultipleChoice(v, allVocabs));
                    }
                });
                case KANJI -> kanjiRepository.findById(item.getEntityId())
                        .ifPresent(k -> exercises.add(buildKanjiFlashcard(k)));
                case GRAMMAR -> grammarPointRepository.findById(item.getEntityId())
                        .ifPresent(g -> exercises.add(buildGrammarFlashcard(g)));
            }
        }
        return exercises;
    }

    /** Single flashcard for a given entity — used by SRS review. */
    public Optional<ExerciseDto> generateFlashcard(UserProgress.EntityType type, Long entityId) {
        return switch (type) {
            case VOCABULARY -> vocabularyRepository.findById(entityId).map(this::buildVocabFlashcard);
            case KANJI -> kanjiRepository.findById(entityId).map(this::buildKanjiFlashcard);
            case GRAMMAR -> grammarPointRepository.findById(entityId).map(this::buildGrammarFlashcard);
        };
    }

    /** Random multiple_choice vocab exercises for a level — used by practice quiz. */
    public List<ExerciseDto> randomVocabExercises(String level, int limit) {
        List<Vocabulary> rawPool = (level != null && !level.isBlank())
                ? vocabularyRepository.findByJlptLevelIgnoreCase(level, PageRequest.of(0, 500)).getContent()
                : vocabularyRepository.findAll();

        // Only Vietnamese-translated words: an English "correct answer" reads as broken next to Vietnamese distractors.
        List<Vocabulary> pool = rawPool.stream()
                .filter(v -> !isEnglish(v.getDisplayMeaning()))
                .collect(Collectors.toList());

        List<Vocabulary> shuffled = new ArrayList<>(pool);
        Collections.shuffle(shuffled);

        return shuffled.stream()
                .limit(limit)
                .map(v -> buildVocabMultipleChoice(v, pool))
                .collect(Collectors.toList());
    }

    /** Random flashcard kanji exercises for a level — used by practice quiz. */
    public List<ExerciseDto> randomKanjiExercises(String level, int limit) {
        List<Kanji> pool = (level != null && !level.isBlank())
                ? kanjiRepository.findByJlptLevelIgnoreCase(level, PageRequest.of(0, 500)).getContent()
                : kanjiRepository.findAll();

        List<Kanji> shuffled = new ArrayList<>(pool);
        Collections.shuffle(shuffled);

        return shuffled.stream().limit(limit).map(this::buildKanjiFlashcard).collect(Collectors.toList());
    }

    /** Random flashcard grammar exercises for a level — used by practice quiz. */
    public List<ExerciseDto> randomGrammarExercises(String level, int limit) {
        List<GrammarPoint> pool = (level != null && !level.isBlank())
                ? grammarPointRepository.findByJlptLevelIgnoreCase(level, PageRequest.of(0, 500)).getContent()
                : grammarPointRepository.findAll();

        List<GrammarPoint> shuffled = new ArrayList<>(pool);
        Collections.shuffle(shuffled);

        return shuffled.stream().limit(limit).map(this::buildGrammarFlashcard).collect(Collectors.toList());
    }

    private ExerciseDto buildVocabFlashcard(Vocabulary v) {
        String meaningStr = v.getDisplayMeaning();
        String readingStr = v.getDisplayReading();
        return ExerciseDto.builder()
                .id(UUID.randomUUID().toString())
                .type("flashcard")
                .question(v.getWord())
                .questionFurigana(readingStr)
                .questionMeaning(meaningStr)
                .correctAnswer(meaningStr)
                .explanation("Từ vựng: " + v.getWord() + " (" + readingStr + ") = " + meaningStr)
                .entityType("VOCABULARY")
                .entityId(v.getId())
                .build();
    }

    private ExerciseDto buildVocabMultipleChoice(Vocabulary v, List<Vocabulary> allVocabs) {
        String meaningStr = v.getDisplayMeaning();
        String readingStr = v.getDisplayReading();
        return ExerciseDto.builder()
                .id(UUID.randomUUID().toString())
                .type("multiple_choice")
                .question("Từ \"" + v.getWord() + "\" (" + readingStr + ") có nghĩa là gì?")
                .questionFurigana(readingStr)
                .options(generateVocabOptions(v, allVocabs))
                .correctAnswer(meaningStr)
                .explanation("Nghĩa đúng của " + v.getWord() + " là: " + meaningStr)
                .entityType("VOCABULARY")
                .entityId(v.getId())
                .build();
    }

    private ExerciseDto buildKanjiFlashcard(Kanji k) {
        String meaningStr = k.getDisplayMeaning();
        return ExerciseDto.builder()
                .id(UUID.randomUUID().toString())
                .type("flashcard")
                .question(k.getCharacter())
                .questionFurigana("Âm On: " + (k.getOnReadings() != null ? k.getOnReadings() : "—"))
                .questionMeaning(meaningStr)
                .correctAnswer(meaningStr)
                .explanation("Chữ Hán: " + k.getCharacter() + " | Nghĩa: " + meaningStr + " | Âm Kun: " + (k.getKunReadings() != null ? k.getKunReadings() : "—"))
                .entityType("KANJI")
                .entityId(k.getId())
                .build();
    }

    private ExerciseDto buildGrammarFlashcard(GrammarPoint g) {
        String meaningStr = g.getMeaning() != null ? g.getMeaning() : "";
        return ExerciseDto.builder()
                .id(UUID.randomUUID().toString())
                .type("flashcard")
                .question(g.getTitle())
                .questionFurigana(g.getStructure() != null ? g.getStructure() : "")
                .questionMeaning(meaningStr)
                .correctAnswer(meaningStr)
                .explanation("Cấu trúc: " + g.getStructure() + "\n" + meaningStr)
                .entityType("GRAMMAR")
                .entityId(g.getId())
                .build();
    }

    private List<ExerciseDto.OptionDto> generateVocabOptions(Vocabulary v, List<Vocabulary> allVocabs) {
        List<ExerciseDto.OptionDto> options = new ArrayList<>();
        String correctAnswer = v.getDisplayMeaning();
        options.add(ExerciseDto.OptionDto.builder().id(correctAnswer).text(correctAnswer).build());

        List<String> distractors = allVocabs.stream()
                .filter(other -> !other.getId().equals(v.getId()))
                .map(Vocabulary::getDisplayMeaning)
                .filter(m -> m != null && !m.isBlank() && !m.equalsIgnoreCase(correctAnswer) && !isEnglish(m))
                .distinct()
                .collect(Collectors.toList());

        Collections.shuffle(distractors);

        for (int i = 0; i < Math.min(3, distractors.size()); i++) {
            String wrongAnswer = distractors.get(i);
            options.add(ExerciseDto.OptionDto.builder().id(wrongAnswer).text(wrongAnswer).build());
        }

        // Fallback distractors if less than 3
        String[] defaultWrong = {"ăn uống", "đi lại", "học tập", "thời gian", "nghỉ ngơi"};
        int fallbackIdx = 0;
        while (options.size() < 4 && fallbackIdx < defaultWrong.length) {
            String fb = defaultWrong[fallbackIdx++];
            if (options.stream().noneMatch(o -> o.getText().equalsIgnoreCase(fb))) {
                options.add(ExerciseDto.OptionDto.builder().id(fb).text(fb).build());
            }
        }

        Collections.shuffle(options);
        return options;
    }

    /** Heuristic: true if text has no Vietnamese diacritics and looks like plain ASCII (i.e. never translated). */
    private boolean isEnglish(String text) {
        if (text == null || text.isBlank()) return true;
        String trimmed = text.trim();
        boolean hasVietnameseDiacritics = trimmed.toLowerCase()
                .matches(".*[àáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ].*");
        if (hasVietnameseDiacritics) {
            return false;
        }
        return trimmed.matches("^[a-zA-Z0-9\\s,()/.'-–]+$");
    }
}
