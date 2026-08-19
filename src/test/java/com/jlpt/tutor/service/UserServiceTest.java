package com.jlpt.tutor.service;

import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void testBuildUserContext_UserExists() {
        User user = User.builder()
                .id("user-001")
                .username("Minh")
                .jlptLevel("N4")
                .mockScore(80)
                .streakDays(5)
                .lastActiveAt(LocalDateTime.now())
                .build();
        when(userRepository.findById("user-001")).thenReturn(Optional.of(user));

        Map<String, String> context = userService.buildUserContext("user-001");

        assertEquals("Minh", context.get("user_name"));
        assertEquals("N4", context.get("jlpt_level"));
        assertEquals("80", context.get("last_mock_score"));
        assertEquals("5", context.get("streak_days"));
    }

    @Test
    void testBuildUserContext_UserNotFound() {
        when(userRepository.findById("nonexistent")).thenReturn(Optional.empty());

        Map<String, String> context = userService.buildUserContext("nonexistent");

        assertTrue(context.isEmpty());
    }

    @Test
    void testBuildUserContext_NullFields() {
        User user = User.builder()
                .id("user-002")
                .lastActiveAt(LocalDateTime.now())
                .build();
        when(userRepository.findById("user-002")).thenReturn(Optional.of(user));

        Map<String, String> context = userService.buildUserContext("user-002");

        assertEquals("Bạn", context.get("user_name"));
        assertEquals("N5", context.get("jlpt_level"));
        assertEquals("Chưa làm bài test", context.get("last_mock_score"));
        assertEquals("1", context.get("streak_days"));
    }

    @Test
    void testFindById() {
        User user = User.builder().id("user-001").username("Minh").build();
        when(userRepository.findById("user-001")).thenReturn(Optional.of(user));

        Optional<User> result = userService.findById("user-001");

        assertTrue(result.isPresent());
        assertEquals("Minh", result.get().getDisplayName());
    }
}
