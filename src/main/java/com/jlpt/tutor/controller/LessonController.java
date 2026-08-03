package com.jlpt.tutor.controller;

import com.jlpt.tutor.dto.ExerciseDto;
import com.jlpt.tutor.dto.LessonDto;
import com.jlpt.tutor.entity.*;
import com.jlpt.tutor.repository.*;
import com.jlpt.tutor.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
@Slf4j
public class LessonController {

    private final LessonRepository lessonRepository;
    private final LessonItemRepository lessonItemRepository;
    private final VocabularyRepository vocabularyRepository;
    private final KanjiRepository kanjiRepository;
    private final GrammarPointRepository grammarPointRepository;
    private final UserProgressRepository userProgressRepository;
    private final QuizSessionRepository quizSessionRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    private String getUserId(Authentication authentication) {
        if (authentication == null) return null;
        if (authentication.getPrincipal() instanceof User user) {
            return user.getId();
        }
        return authentication.getName();
    }

    /**
     * GET /api/lessons?level=N5&type=VOCABULARY
     * Lấy danh sách bài học theo JLPT level và content type.
     */
    @GetMapping
    public ResponseEntity<List<LessonDto.LessonResponse>> getLessons(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String type,
            Authentication authentication) {

        String userId = getUserId(authentication);
        List<Lesson> lessons;

        String filterLevel = (level != null && !level.isBlank() && !"ALL".equalsIgnoreCase(level)) ? level.toUpperCase() : null;
        Lesson.ContentType filterType = null;
        if (type != null && !type.isBlank() && !"ALL".equalsIgnoreCase(type)) {
            try {
                filterType = Lesson.ContentType.valueOf(type.toUpperCase());
            } catch (Exception e) {
                log.warn("Invalid content type filter: {}", type);
            }
        }

        if (filterLevel != null && filterType != null) {
            lessons = lessonRepository.findByJlptLevelAndContentTypeOrderByOrderIndex(filterLevel, filterType);
        } else if (filterLevel != null) {
            lessons = lessonRepository.findByJlptLevelOrderByOrderIndex(filterLevel);
        } else if (filterType != null) {
            lessons = lessonRepository.findByContentTypeOrderByJlptLevelAscOrderIndexAsc(filterType);
        } else {
            lessons = lessonRepository.findAll();
        }

        Set<String> masteredKeys = new java.util.HashSet<>();
        Map<Long, List<LessonItem>> itemsByLessonMap = new java.util.HashMap<>();

        if (!lessons.isEmpty()) {
            List<Long> lessonIds = lessons.stream().map(Lesson::getId).toList();
            List<LessonItem> allItems = lessonItemRepository.findByLessonIdIn(lessonIds);
            for (LessonItem item : allItems) {
                itemsByLessonMap.computeIfAbsent(item.getLessonId(), k -> new java.util.ArrayList<>()).add(item);
            }

            if (userId != null) {
                List<UserProgress> userProgressList = userProgressRepository.findByUserId(userId);
                for (UserProgress p : userProgressList) {
                    if (p.getStatus() == UserProgress.ProgressStatus.MASTERED) {
                        masteredKeys.add(p.getEntityType() + "_" + p.getEntityId());
                    }
                }
            }
        }

        List<LessonDto.LessonResponse> response = lessons.stream()
            .map(l -> {
                int completedCount = 0;
                List<LessonItem> items = itemsByLessonMap.getOrDefault(l.getId(), java.util.Collections.emptyList());
                for (LessonItem item : items) {
                    String key = item.getEntityType() + "_" + item.getEntityId();
                    if (masteredKeys.contains(key)) {
                        completedCount++;
                    }
                }

                String status = "available";
                if (l.getItemCount() > 0 && completedCount >= l.getItemCount()) {
                    status = "completed";
                } else if (completedCount > 0) {
                    status = "in_progress";
                }

                return LessonDto.LessonResponse.builder()
                    .id(l.getId())
                    .title(l.getTitle())
                    .description(l.getDescription())
                    .jlptLevel(l.getJlptLevel())
                    .contentType(l.getContentType().name())
                    .orderIndex(l.getOrderIndex())
                    .itemCount(l.getItemCount())
                    .completedCount(completedCount)
                    .status(status)
                    .build();
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/lessons/{id}
     * Lấy chi tiết một bài học.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LessonDto.LessonResponse> getLesson(
            @PathVariable Long id,
            Authentication authentication) {
        return lessonRepository.findById(id)
            .map(l -> ResponseEntity.ok(LessonDto.LessonResponse.builder()
                .id(l.getId())
                .title(l.getTitle())
                .description(l.getDescription())
                .jlptLevel(l.getJlptLevel())
                .contentType(l.getContentType().name())
                .orderIndex(l.getOrderIndex())
                .itemCount(l.getItemCount())
                .completedCount(0)
                .status("available")
                .build()))
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/lessons/{id}/exercises
     * Tạo danh sách bài tập thực tế dựa trên LessonItem của lesson.
     */
    @GetMapping("/{id}/exercises")
    public ResponseEntity<List<ExerciseDto>> getExercises(
            @PathVariable Long id,
            Authentication authentication) {

        Optional<Lesson> lessonOpt = lessonRepository.findById(id);
        if (lessonOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<LessonItem> items = lessonItemRepository.findByLessonIdOrderByOrderIndex(id);
        List<ExerciseDto> exercises = new ArrayList<>();

        for (LessonItem item : items) {
            if (item.getEntityType() == UserProgress.EntityType.VOCABULARY) {
                vocabularyRepository.findById(item.getEntityId()).ifPresent(v -> {
                    exercises.add(ExerciseDto.builder()
                        .id(UUID.randomUUID().toString())
                        .type("flashcard")
                        .question(v.getWord())
                        .questionFurigana(v.getReading())
                        .questionMeaning(v.getMeaning())
                        .correctAnswer(v.getMeaning())
                        .explanation("Từ vựng: " + v.getWord() + " (" + v.getReading() + ") = " + v.getMeaning())
                        .entityType("VOCABULARY")
                        .entityId(v.getId())
                        .build());

                    exercises.add(ExerciseDto.builder()
                        .id(UUID.randomUUID().toString())
                        .type("multiple_choice")
                        .question("Từ \"" + v.getWord() + "\" (" + v.getReading() + ") có nghĩa là gì?")
                        .questionFurigana(v.getReading())
                        .options(generateVocabOptions(v))
                        .correctAnswer(v.getMeaning())
                        .explanation("Nghĩa đúng của " + v.getWord() + " là: " + v.getMeaning())
                        .entityType("VOCABULARY")
                        .entityId(v.getId())
                        .build());
                });
            } else if (item.getEntityType() == UserProgress.EntityType.KANJI) {
                kanjiRepository.findById(item.getEntityId()).ifPresent(k -> {
                    exercises.add(ExerciseDto.builder()
                        .id(UUID.randomUUID().toString())
                        .type("flashcard")
                        .question(k.getCharacter())
                        .questionFurigana("Âm On: " + (k.getOnReadings() != null ? k.getOnReadings() : "—"))
                        .questionMeaning(k.getMeanings())
                        .correctAnswer(k.getMeanings())
                        .explanation("Chữ Hán: " + k.getCharacter() + " | Âm Kun: " + (k.getKunReadings() != null ? k.getKunReadings() : "—"))
                        .entityType("KANJI")
                        .entityId(k.getId())
                        .build());
                });
            } else if (item.getEntityType() == UserProgress.EntityType.GRAMMAR) {
                grammarPointRepository.findById(item.getEntityId()).ifPresent(g -> {
                    exercises.add(ExerciseDto.builder()
                        .id(UUID.randomUUID().toString())
                        .type("flashcard")
                        .question(g.getTitle())
                        .questionFurigana(g.getStructure() != null ? g.getStructure() : "")
                        .questionMeaning(g.getMeaning())
                        .correctAnswer(g.getMeaning())
                        .explanation("Cấu trúc: " + g.getStructure() + "\n" + g.getMeaning())
                        .entityType("GRAMMAR")
                        .entityId(g.getId())
                        .build());
                });
            }
        }

        return ResponseEntity.ok(exercises);
    }

    /**
     * POST /api/lessons/{id}/complete
     * Lưu kết quả hoàn thành lesson, cộng XP, ghi nhận QuizSession & UserProgress.
     */
    @PostMapping("/{id}/complete")
    @Transactional
    public ResponseEntity<LessonDto.CompleteResponse> completeLesson(
            @PathVariable Long id,
            @RequestBody LessonDto.CompleteRequest request,
            Authentication authentication) {

        String userId = getUserId(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<LessonDto.QuizResultDto> results = request.getResults() != null ? request.getResults() : Collections.emptyList();
        int correct = (int) results.stream().filter(r -> Boolean.TRUE.equals(r.getCorrect())).count();
        int total = results.size();
        int score = total > 0 ? Math.round((float) correct / total * 100) : 0;
        int xpEarned = score / 10 * 5; // 5 XP per 10% score
        long totalTimeMs = request.getTotalTimeMs() != null ? request.getTotalTimeMs() : 0L;

        log.info("Lesson {} completed by user {} — score: {}, XP: {}", id, userId, score, xpEarned);

        // 1. Save QuizSession record
        QuizSession session = QuizSession.builder()
                .userId(userId)
                .lessonId(id)
                .sessionType(QuizSession.SessionType.LESSON)
                .score(score)
                .xpEarned(xpEarned)
                .correctCount(correct)
                .totalCount(total)
                .totalTimeMs(totalTimeMs)
                .completedAt(LocalDateTime.now())
                .build();
        quizSessionRepository.save(session);

        // 2. Update UserProgress for each exercise result
        for (LessonDto.QuizResultDto result : results) {
            if (result.getEntityType() != null && result.getEntityId() != null) {
                try {
                    UserProgress.EntityType type = UserProgress.EntityType.valueOf(result.getEntityType());
                    UserProgress.ProgressStatus status = Boolean.TRUE.equals(result.getCorrect())
                            ? UserProgress.ProgressStatus.MASTERED
                            : UserProgress.ProgressStatus.LEARNING;

                    UserProgress progress = userProgressRepository
                            .findByUserIdAndEntityTypeAndEntityId(userId, type, result.getEntityId())
                            .orElse(UserProgress.builder()
                                    .userId(userId)
                                    .entityType(type)
                                    .entityId(result.getEntityId())
                                    .reviewCount(0)
                                    .xp(0)
                                    .build());

                    progress.setStatus(status);
                    progress.setReviewCount(progress.getReviewCount() + 1);
                    progress.setLastReviewDate(LocalDateTime.now());
                    if (status == UserProgress.ProgressStatus.MASTERED) {
                        progress.setXp(progress.getXp() + 10);
                    }
                    userProgressRepository.save(progress);
                } catch (Exception e) {
                    log.warn("Failed to save progress result for item {}", result.getEntityId(), e);
                }
            }
        }

        // 3. Update User streak & last active
        userRepository.findById(userId).ifPresent(user -> {
            userService.updateStreakAndLastActive(user);
        });

        return ResponseEntity.ok(LessonDto.CompleteResponse.builder()
            .xpEarned(xpEarned)
            .correctCount(correct)
            .totalCount(total)
            .score(score)
            .streakUpdated(true)
            .build());
    }

    private List<ExerciseDto.OptionDto> generateVocabOptions(Vocabulary v) {
        List<ExerciseDto.OptionDto> options = new ArrayList<>();
        options.add(ExerciseDto.OptionDto.builder().id(v.getMeaning()).text(v.getMeaning()).build());
        options.add(ExerciseDto.OptionDto.builder().id("ăn uống").text("ăn uống").build());
        options.add(ExerciseDto.OptionDto.builder().id("đi lại").text("đi lại").build());
        options.add(ExerciseDto.OptionDto.builder().id("học tập").text("học tập").build());
        Collections.shuffle(options);
        return options;
    }
}
