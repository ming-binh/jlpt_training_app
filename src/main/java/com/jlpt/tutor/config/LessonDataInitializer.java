package com.jlpt.tutor.config;

import com.jlpt.tutor.entity.*;
import com.jlpt.tutor.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LessonDataInitializer implements CommandLineRunner {

    private final LessonRepository lessonRepository;
    private final LessonItemRepository lessonItemRepository;
    private final VocabularyRepository vocabularyRepository;
    private final KanjiRepository kanjiRepository;
    private final GrammarPointRepository grammarPointRepository;

    @Override
    public void run(String... args) throws Exception {
        if (lessonRepository.count() > 0) {
            log.info("Lessons already initialized (count: {}). Skipping seeding.", lessonRepository.count());
            return;
        }

        log.info("Initializing Lessons and LessonItems from database content...");
        String[] levels = {"N5", "N4", "N3"};

        for (String level : levels) {
            seedVocabLessons(level);
            seedKanjiLessons(level);
            seedGrammarLessons(level);
        }

        log.info("Successfully seeded {} lessons and {} lesson items!",
                lessonRepository.count(), lessonItemRepository.count());
    }

    private void seedVocabLessons(String level) {
        List<Vocabulary> vocabList = vocabularyRepository
                .findByJlptLevelIgnoreCase(level, Pageable.unpaged())
                .getContent();

        if (vocabList.isEmpty()) return;

        int chunkSize = 15;
        int totalLessons = (int) Math.ceil((double) vocabList.size() / chunkSize);

        for (int i = 0; i < totalLessons; i++) {
            int start = i * chunkSize;
            int end = Math.min(start + chunkSize, vocabList.size());
            List<Vocabulary> chunk = vocabList.subList(start, end);

            Lesson lesson = Lesson.builder()
                    .title(String.format("%s Từ Vựng - Bài %d", level, i + 1))
                    .description(String.format("Luyện tập %d từ vựng JLPT %s cơ bản", chunk.size(), level))
                    .jlptLevel(level)
                    .contentType(Lesson.ContentType.VOCABULARY)
                    .orderIndex(i + 1)
                    .itemCount(chunk.size())
                    .published(true)
                    .build();

            lesson = lessonRepository.save(lesson);

            for (int j = 0; j < chunk.size(); j++) {
                Vocabulary vocab = chunk.get(j);
                LessonItem item = LessonItem.builder()
                        .lessonId(lesson.getId())
                        .entityId(vocab.getId())
                        .entityType(UserProgress.EntityType.VOCABULARY)
                        .orderIndex(j + 1)
                        .build();
                lessonItemRepository.save(item);
            }
        }
    }

    private void seedKanjiLessons(String level) {
        List<Kanji> kanjiList = kanjiRepository
                .findByJlptLevelIgnoreCase(level, Pageable.unpaged())
                .getContent();

        if (kanjiList.isEmpty()) return;

        int chunkSize = 12;
        int totalLessons = (int) Math.ceil((double) kanjiList.size() / chunkSize);

        for (int i = 0; i < totalLessons; i++) {
            int start = i * chunkSize;
            int end = Math.min(start + chunkSize, kanjiList.size());
            List<Kanji> chunk = kanjiList.subList(start, end);

            Lesson lesson = Lesson.builder()
                    .title(String.format("%s Kanji - Bài %d", level, i + 1))
                    .description(String.format("Học %d chữ Hán JLPT %s cơ bản", chunk.size(), level))
                    .jlptLevel(level)
                    .contentType(Lesson.ContentType.KANJI)
                    .orderIndex(i + 1)
                    .itemCount(chunk.size())
                    .published(true)
                    .build();

            lesson = lessonRepository.save(lesson);

            for (int j = 0; j < chunk.size(); j++) {
                Kanji kanji = chunk.get(j);
                LessonItem item = LessonItem.builder()
                        .lessonId(lesson.getId())
                        .entityId(kanji.getId())
                        .entityType(UserProgress.EntityType.KANJI)
                        .orderIndex(j + 1)
                        .build();
                lessonItemRepository.save(item);
            }
        }
    }

    private void seedGrammarLessons(String level) {
        List<GrammarPoint> grammarList = grammarPointRepository
                .findByJlptLevelIgnoreCase(level, Pageable.unpaged())
                .getContent();

        if (grammarList.isEmpty()) return;

        int chunkSize = 10;
        int totalLessons = (int) Math.ceil((double) grammarList.size() / chunkSize);

        for (int i = 0; i < totalLessons; i++) {
            int start = i * chunkSize;
            int end = Math.min(start + chunkSize, grammarList.size());
            List<GrammarPoint> chunk = grammarList.subList(start, end);

            Lesson lesson = Lesson.builder()
                    .title(String.format("%s Ngữ Pháp - Bài %d", level, i + 1))
                    .description(String.format("Cấu trúc ngữ pháp JLPT %s - Phần %d", level, i + 1))
                    .jlptLevel(level)
                    .contentType(Lesson.ContentType.GRAMMAR)
                    .orderIndex(i + 1)
                    .itemCount(chunk.size())
                    .published(true)
                    .build();

            lesson = lessonRepository.save(lesson);

            for (int j = 0; j < chunk.size(); j++) {
                GrammarPoint grammar = chunk.get(j);
                LessonItem item = LessonItem.builder()
                        .lessonId(lesson.getId())
                        .entityId(grammar.getId())
                        .entityType(UserProgress.EntityType.GRAMMAR)
                        .orderIndex(j + 1)
                        .build();
                lessonItemRepository.save(item);
            }
        }
    }
}
