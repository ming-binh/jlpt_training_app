package com.jlpt.tutor.controller;

import com.jlpt.tutor.entity.QuizSession;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.repository.QuizSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizSessionRepository quizSessionRepository;

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
}
