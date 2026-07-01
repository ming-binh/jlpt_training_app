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
                    Map<String, String> context = new HashMap<>();
                    context.put("user_name", user.getUsername() != null ? user.getUsername() : "Bạn");
                    context.put("jlpt_level", user.getJlptLevel() != null ? user.getJlptLevel() : "N5");
                    context.put("last_mock_score", user.getMockScore() != null ? String.valueOf(user.getMockScore()) : "N/A");
                    context.put("weak_sections", ""); // Will be enriched when weak_sections field is added
                    context.put("streak_days", user.getStreakDays() != null ? String.valueOf(user.getStreakDays()) : "0");
                    return context;
                })
                .orElseGet(Map::of);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}
