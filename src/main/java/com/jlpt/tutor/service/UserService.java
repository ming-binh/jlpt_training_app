package com.jlpt.tutor.service;

import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Optional<User> findById(String userId) {
        return userRepository.findById(userId);
    }

    /**
     * Build the userContext map used by PromptBuilder to fill system prompt placeholders.
     * Returns empty map if user not found.
     */
    public Map<String, String> buildUserContext(String userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    // Update user's daily streak on activity
                    updateStreakAndLastActive(user);

                    Map<String, String> context = new HashMap<>();
                    context.put("user_name", user.getDisplayName() != null ? user.getDisplayName() : "Bạn");
                    context.put("jlpt_level", user.getJlptLevel() != null ? user.getJlptLevel() : "N5");
                    context.put("last_mock_score", user.getMockScore() != null ? String.valueOf(user.getMockScore()) : "Chưa làm bài test");
                    context.put("weak_sections", user.getWeakSections() != null ? user.getWeakSections() : "Chưa có dữ liệu");
                    context.put("streak_days", user.getStreakDays() != null ? String.valueOf(user.getStreakDays()) : "1");
                    return context;
                })
                .orElseGet(Map::of);
    }

    /**
     * Update user's daily login streak and last active timestamp.
     */
    public void updateStreakAndLastActive(User user) {
        if (user == null) return;
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDate today = now.toLocalDate();

        if (user.getLastActiveAt() != null) {
            java.time.LocalDate lastActiveDate = user.getLastActiveAt().toLocalDate();
            if (lastActiveDate.equals(today)) {
                // Already active today, no streak increment needed
                return;
            } else if (lastActiveDate.equals(today.minusDays(1))) {
                // Active yesterday -> Increment streak
                int currentStreak = user.getStreakDays() != null ? user.getStreakDays() : 0;
                user.setStreakDays(currentStreak + 1);
            } else {
                // Missed a day or more -> Reset streak to 1
                user.setStreakDays(1);
            }
        } else {
            // First time active
            user.setStreakDays(1);
        }

        user.setLastActiveAt(now);
        userRepository.save(user);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}
