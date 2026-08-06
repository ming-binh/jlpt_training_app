package com.jlpt.tutor.controller;

import com.jlpt.tutor.dto.LessonDto;
import com.jlpt.tutor.entity.QuizSession;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.entity.UserProgress;
import com.jlpt.tutor.repository.QuizSessionRepository;
import com.jlpt.tutor.repository.UserProgressRepository;
import com.jlpt.tutor.repository.UserRepository;
import com.jlpt.tutor.service.SpacedRepetitionService;
import com.jlpt.tutor.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final UserProgressRepository userProgressRepository;
    private final UserRepository userRepository;
    private final QuizSessionRepository quizSessionRepository;
    private final UserService userService;
    private final SpacedRepetitionService spacedRepetitionService;

    private static final int MASTERY_XP = 10;

    @GetMapping("/summary")
    public ResponseEntity<LessonDto.ProgressSummary> getSummary(
            Authentication authentication) {

        String userId = getUserId(authentication);
        if (userId == null) {
            return ResponseEntity.ok(LessonDto.ProgressSummary.builder().build());
        }

        User user = userRepository.findById(userId).orElse(null);
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

        return ResponseEntity.ok(LessonDto.ProgressSummary.builder()
            .streak(user != null && user.getStreakDays() != null ? user.getStreakDays() : 0)
            .xp(totalXp)
            .xpToNextLevel(500)
            .masteredVocab((int) masteredVocab)
            .masteredKanji((int) masteredKanji)
            .masteredGrammar((int) masteredGrammar)
            .todayGoalComplete(masteredVocab + masteredKanji + masteredGrammar > 0)
            .jlptLevel(user != null && user.getJlptLevel() != null ? user.getJlptLevel() : "N5")
            .build());
    }

    @PostMapping("/mark")
    public ResponseEntity<UserProgress> markProgress(
            Authentication authentication,
            @RequestBody MarkProgressRequest request) {

        String userId = getUserId(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        UserProgress.EntityType entityType;
        try {
            entityType = UserProgress.EntityType.valueOf(request.getEntityType().toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }

        UserProgress.ProgressStatus status;
        try {
            status = UserProgress.ProgressStatus.valueOf(request.getStatus().toUpperCase());
        } catch (Exception e) {
            status = UserProgress.ProgressStatus.LEARNING;
        }

        Optional<UserProgress> existingOpt = userProgressRepository.findByUserIdAndEntityTypeAndEntityId(
                userId, entityType, request.getEntityId());

        boolean correct = status == UserProgress.ProgressStatus.MASTERED;
        boolean wasAlreadyMastered = existingOpt.isPresent()
                && existingOpt.get().getStatus() == UserProgress.ProgressStatus.MASTERED;

        UserProgress progress;
        if (existingOpt.isPresent()) {
            progress = existingOpt.get();
            progress.setStatus(status);
            spacedRepetitionService.applyReview(progress, correct);
        } else {
            progress = UserProgress.builder()
                    .userId(userId)
                    .entityType(entityType)
                    .entityId(request.getEntityId())
                    .status(status)
                    .reviewCount(0)
                    .xp(0)
                    .build();
            spacedRepetitionService.applyReview(progress, correct);
        }

        if (status == UserProgress.ProgressStatus.MASTERED && !wasAlreadyMastered) {
            progress.setXp(progress.getXp() + MASTERY_XP);
        }

        UserProgress saved = userProgressRepository.save(progress);
        userRepository.findById(userId).ifPresent(userService::updateStreakAndLastActive);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/my-items")
    public ResponseEntity<List<UserProgress>> getMyProgress(Authentication authentication) {
        String userId = getUserId(authentication);
        if (userId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(userProgressRepository.findByUserId(userId));
    }

    @GetMapping("/streak")
    public ResponseEntity<List<Map<String, Object>>> getStreak(
            Authentication authentication) {

        String userId = getUserId(authentication);
        if (userId == null) {
            return ResponseEntity.ok(List.of());
        }

        LocalDate today = LocalDate.now();
        LocalDate rangeStart = today.minusDays(29);

        List<QuizSession> sessions = quizSessionRepository.findByUserIdAndCompletedAtAfter(
                userId, rangeStart.atStartOfDay());

        Set<LocalDate> studiedDates = sessions.stream()
                .map(s -> s.getCompletedAt().toLocalDate())
                .collect(Collectors.toSet());

        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE;
        List<Map<String, Object>> calendar = new java.util.ArrayList<>();
        for (LocalDate date = rangeStart; !date.isAfter(today); date = date.plusDays(1)) {
            Map<String, Object> day = new LinkedHashMap<>();
            day.put("date", date.format(formatter));
            day.put("studied", studiedDates.contains(date));
            calendar.add(day);
        }

        return ResponseEntity.ok(calendar);
    }

    private String getUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return user.getId();
        }
        return null;
    }

    @Data
    public static class MarkProgressRequest {
        private String entityType; // VOCABULARY, KANJI, GRAMMAR
        private Long entityId;
        private String status;     // LEARNING, MASTERED, REVIEW_NEEDED
    }
}
