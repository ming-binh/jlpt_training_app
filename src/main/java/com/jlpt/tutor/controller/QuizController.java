package com.jlpt.tutor.controller;

import com.jlpt.tutor.dto.ExerciseDto;
import com.jlpt.tutor.dto.LessonDto;
import com.jlpt.tutor.entity.QuizSession;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.entity.UserProgress;
import com.jlpt.tutor.repository.QuizSessionRepository;
import com.jlpt.tutor.repository.UserProgressRepository;
import com.jlpt.tutor.service.ExerciseGeneratorService;
import com.jlpt.tutor.service.ProgressUpdateService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizSessionRepository quizSessionRepository;
    private final UserProgressRepository userProgressRepository;
    private final ExerciseGeneratorService exerciseGeneratorService;
    private final ProgressUpdateService progressUpdateService;

    private String getUserId(Authentication authentication) {
        if (authentication == null) return null;
        if (authentication.getPrincipal() instanceof User user) {
            return user.getId();
        }
        return authentication.getName();
    }

    @GetMapping("/history")
    public ResponseEntity<List<QuizSession>> getQuizHistory(Authentication authentication) {
        String userId = getUserId(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<QuizSession> history = quizSessionRepository.findByUserIdOrderByCompletedAtDesc(userId);
        return ResponseEntity.ok(history);
    }

    /**
     * GET /api/quiz/practice?level=N5&type=VOCABULARY&count=10
     * Bài tập luyện tập ngẫu nhiên, không gắn với lesson cụ thể.
     */
    @GetMapping("/practice")
    public ResponseEntity<List<ExerciseDto>> getPractice(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "10") int count) {

        UserProgress.EntityType filterType = null;
        if (type != null && !type.isBlank()) {
            try {
                filterType = UserProgress.EntityType.valueOf(type.toUpperCase());
            } catch (Exception ignored) {
                // unrecognized type -> fall back to mixed
            }
        }

        List<ExerciseDto> exercises = new ArrayList<>();
        if (filterType == null || filterType == UserProgress.EntityType.VOCABULARY) {
            exercises.addAll(exerciseGeneratorService.randomVocabExercises(level, count));
        }
        if (filterType == null || filterType == UserProgress.EntityType.KANJI) {
            exercises.addAll(exerciseGeneratorService.randomKanjiExercises(level, count));
        }
        if (filterType == null || filterType == UserProgress.EntityType.GRAMMAR) {
            exercises.addAll(exerciseGeneratorService.randomGrammarExercises(level, count));
        }

        Collections.shuffle(exercises);
        return ResponseEntity.ok(exercises.stream().limit(count).toList());
    }

    /**
     * GET /api/quiz/review
     * Danh sách thẻ đến hạn ôn tập hôm nay, dựa trên nextReviewDate (SM-2).
     */
    @GetMapping("/review")
    public ResponseEntity<List<ExerciseDto>> getReviewItems(Authentication authentication) {
        String userId = getUserId(authentication);
        if (userId == null) {
            return ResponseEntity.ok(List.of());
        }

        List<UserProgress> dueItems = userProgressRepository
                .findByUserIdAndNextReviewDateBefore(userId, LocalDateTime.now());

        List<ExerciseDto> exercises = dueItems.stream()
                .map(p -> exerciseGeneratorService.generateFlashcard(p.getEntityType(), p.getEntityId()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();

        return ResponseEntity.ok(exercises);
    }

    /**
     * POST /api/quiz/submit
     * Nộp kết quả practice/review: cập nhật UserProgress (SM-2 + XP) và lưu QuizSession.
     */
    @PostMapping("/submit")
    public ResponseEntity<LessonDto.CompleteResponse> submitResults(
            @RequestBody SubmitRequest request,
            Authentication authentication) {

        String userId = getUserId(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<LessonDto.QuizResultDto> results = request.getResults() != null ? request.getResults() : Collections.emptyList();

        ProgressUpdateService.ResultSummary summary = progressUpdateService.applyResults(userId, results);
        int score = summary.totalCount() > 0
                ? Math.round((float) summary.correctCount() / summary.totalCount() * 100)
                : 0;
        int xpEarned = score / 10 * 5;

        QuizSession session = QuizSession.builder()
                .userId(userId)
                .sessionType(QuizSession.SessionType.PRACTICE)
                .score(score)
                .xpEarned(xpEarned)
                .correctCount(summary.correctCount())
                .totalCount(summary.totalCount())
                .completedAt(LocalDateTime.now())
                .build();
        quizSessionRepository.save(session);

        return ResponseEntity.ok(LessonDto.CompleteResponse.builder()
                .xpEarned(xpEarned)
                .correctCount(summary.correctCount())
                .totalCount(summary.totalCount())
                .score(score)
                .streakUpdated(false)
                .build());
    }

    @Data
    public static class SubmitRequest {
        private List<LessonDto.QuizResultDto> results;
    }
}
