package com.jlpt.tutor.controller;

import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.entity.UserProgress;
import com.jlpt.tutor.repository.UserProgressRepository;
import com.jlpt.tutor.repository.UserRepository;
import com.jlpt.tutor.service.UserService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final UserProgressRepository userProgressRepository;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            return ResponseEntity.notFound().build();
        }
        userService.updateStreakAndLastActive(user);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/me/dashboard-stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            return ResponseEntity.notFound().build();
        }

        userService.updateStreakAndLastActive(user);

        // Fetch completed progress records for vocab, kanji, grammar
        List<UserProgress> userProgressList = userProgressRepository.findByUserId(user.getId());
        long completedVocab = userProgressList.stream()
                .filter(p -> p.getEntityType() == UserProgress.EntityType.VOCABULARY && p.getStatus() == UserProgress.ProgressStatus.MASTERED)
                .count();
        long completedKanji = userProgressList.stream()
                .filter(p -> p.getEntityType() == UserProgress.EntityType.KANJI && p.getStatus() == UserProgress.ProgressStatus.MASTERED)
                .count();
        long completedGrammar = userProgressList.stream()
                .filter(p -> p.getEntityType() == UserProgress.EntityType.GRAMMAR && p.getStatus() == UserProgress.ProgressStatus.MASTERED)
                .count();

        DashboardStatsResponse stats = DashboardStatsResponse.builder()
                .userId(user.getId())
                .username(user.getDisplayName() != null ? user.getDisplayName() : "Học Viên")
                .jlptLevel(user.getJlptLevel() != null ? user.getJlptLevel() : "N5")
                .streakDays(user.getStreakDays() != null ? user.getStreakDays() : 1)
                .mockScore(user.getMockScore())
                .weakSections(user.getWeakSections())
                .completedVocab((int) completedVocab)
                .completedKanji((int) completedKanji)
                .completedGrammar((int) completedGrammar)
                .build();

        return ResponseEntity.ok(stats);
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {

        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            return ResponseEntity.notFound().build();
        }

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            user.setUsername(request.getUsername().trim());
        }
        if (request.getJlptLevel() != null && !request.getJlptLevel().isBlank()) {
            user.setJlptLevel(request.getJlptLevel().toUpperCase().trim());
        }

        User updated = userRepository.save(user);
        return ResponseEntity.ok(updated);
    }

    @Data
    public static class UpdateProfileRequest {
        private String username;
        private String jlptLevel;
    }

    @Data
    @Builder
    public static class DashboardStatsResponse {
        private String userId;
        private String username;
        private String jlptLevel;
        private Integer streakDays;
        private Integer mockScore;
        private String weakSections;
        private Integer completedVocab;
        private Integer completedKanji;
        private Integer completedGrammar;
    }
}
