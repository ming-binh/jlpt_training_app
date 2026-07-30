package com.jlpt.tutor.controller;

import com.jlpt.tutor.dto.LessonDto;
import com.jlpt.tutor.entity.UserProgress;
import com.jlpt.tutor.repository.UserProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final UserProgressRepository userProgressRepository;

    /**
     * GET /api/progress/summary
     * Lấy tổng quan tiến độ học tập của user.
     */
    @GetMapping("/summary")
    public ResponseEntity<LessonDto.ProgressSummary> getSummary(
            Authentication authentication) {

        String userId = authentication.getName();
        List<UserProgress> progresses = userProgressRepository.findByUserId(userId);

        long masteredVocab = progresses.stream()
            .filter(p -> p.getEntityType() == UserProgress.EntityType.VOCABULARY
                      && p.getStatus() == UserProgress.ProgressStatus.MASTERED)
            .count();

        long masteredKanji = progresses.stream()
            .filter(p -> p.getEntityType() == UserProgress.EntityType.KANJI
                      && p.getStatus() == UserProgress.ProgressStatus.MASTERED)
            .count();

        long masteredGrammar = progresses.stream()
            .filter(p -> p.getEntityType() == UserProgress.EntityType.GRAMMAR
                      && p.getStatus() == UserProgress.ProgressStatus.MASTERED)
            .count();

        int totalXp = progresses.stream()
            .mapToInt(p -> p.getXp() != null ? p.getXp() : 0)
            .sum();

        // TODO: Calculate real streak from QuizSession history
        // TODO: Determine current JLPT level from user profile

        return ResponseEntity.ok(LessonDto.ProgressSummary.builder()
            .streak(0)             // TODO: from QuizSession streak calculation
            .xp(totalXp)
            .xpToNextLevel(500)   // TODO: configurable per level
            .masteredVocab((int) masteredVocab)
            .masteredKanji((int) masteredKanji)
            .masteredGrammar((int) masteredGrammar)
            .todayGoalComplete(false) // TODO: check today's sessions
            .jlptLevel("N5")      // TODO: from user profile
            .build());
    }

    /**
     * GET /api/progress/streak
     * Lấy streak calendar data (30 ngày gần nhất).
     * TODO: Implement from QuizSession records.
     */
    @GetMapping("/streak")
    public ResponseEntity<List<Map<String, Object>>> getStreak(
            Authentication authentication) {
        // Placeholder — returns empty. Will be implemented with QuizSession.
        return ResponseEntity.ok(List.of());
    }
}
