package com.jlpt.tutor.controller;

import com.jlpt.tutor.dto.LessonDto;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.entity.UserProgress;
import com.jlpt.tutor.repository.UserProgressRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final UserProgressRepository userProgressRepository;

    @GetMapping("/summary")
    public ResponseEntity<LessonDto.ProgressSummary> getSummary(
            Authentication authentication) {

        String userId = getUserId(authentication);
        if (userId == null) {
            return ResponseEntity.ok(LessonDto.ProgressSummary.builder().build());
        }

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
            .streak(1)
            .xp(totalXp)
            .xpToNextLevel(500)
            .masteredVocab((int) masteredVocab)
            .masteredKanji((int) masteredKanji)
            .masteredGrammar((int) masteredGrammar)
            .todayGoalComplete(masteredVocab + masteredKanji + masteredGrammar > 0)
            .jlptLevel("N5")
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

        UserProgress progress;
        if (existingOpt.isPresent()) {
            progress = existingOpt.get();
            progress.setStatus(status);
            progress.setReviewCount(progress.getReviewCount() + 1);
            progress.setLastReviewDate(LocalDateTime.now());
            if (request.getXp() != null) {
                progress.setXp(progress.getXp() + request.getXp());
            }
        } else {
            progress = UserProgress.builder()
                    .userId(userId)
                    .entityType(entityType)
                    .entityId(request.getEntityId())
                    .status(status)
                    .reviewCount(1)
                    .lastReviewDate(LocalDateTime.now())
                    .xp(request.getXp() != null ? request.getXp() : 10)
                    .build();
        }

        UserProgress saved = userProgressRepository.save(progress);
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
        return ResponseEntity.ok(List.of());
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
        private Integer xp;
    }
}
