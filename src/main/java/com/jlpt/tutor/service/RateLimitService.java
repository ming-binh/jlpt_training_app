package com.jlpt.tutor.service;

import com.jlpt.tutor.config.RateLimitConfig;
import com.jlpt.tutor.exception.RateLimitException;
import com.jlpt.tutor.model.AiUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Slf4j
@Service
@RequiredArgsConstructor
public class RateLimitService {

    private final RateLimitConfig config;

    // Key: "userId:useCase", Value: deque of request timestamps
    private final ConcurrentHashMap<String, ConcurrentLinkedDeque<Instant>> requestLog = new ConcurrentHashMap<>();

    /**
     * Check if the request is within rate limits. Throws RateLimitException if exceeded.
     */
    public void checkRateLimit(String userId, AiUseCase useCase) {
        if (userId == null || userId.isBlank()) {
            return; // No rate limiting for anonymous users
        }

        String key = userId + ":" + useCase.name();
        int maxRequests = getMaxRequests(useCase);
        Duration window = getWindow(useCase);

        ConcurrentLinkedDeque<Instant> timestamps = requestLog.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());

        Instant cutoff = Instant.now().minus(window);

        // Evict expired entries
        while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(cutoff)) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= maxRequests) {
            log.warn("Rate limit exceeded for userId={}, useCase={}, count={}/{}",
                    userId, useCase, timestamps.size(), maxRequests);
            throw new RateLimitException(
                    String.format("Bạn đã vượt quá giới hạn %d requests/%s cho %s. Vui lòng thử lại sau.",
                            maxRequests, formatWindow(window), useCase.name()));
        }

        timestamps.addLast(Instant.now());
    }

    private int getMaxRequests(AiUseCase useCase) {
        return switch (useCase) {
            case CONVERSATION -> config.getConversationPerDay();
            case WRITING_CHECK -> config.getWritingCheckPerDay();
            case GRAMMAR_EXPLAIN, QUIZ_EXPLANATION -> config.getExplanationPerDay();
            case MOCK_ANALYSIS -> config.getConversationPerDay(); // Reuse conversation limit
        };
    }

    private Duration getWindow(AiUseCase useCase) {
        return switch (useCase) {
            case CONVERSATION, WRITING_CHECK, GRAMMAR_EXPLAIN, QUIZ_EXPLANATION, MOCK_ANALYSIS -> Duration.ofDays(1);
        };
    }

    private String formatWindow(Duration window) {
        if (window.toHours() >= 24) {
            return window.toDays() + " ngày";
        }
        return window.toMinutes() + " phút";
    }

    // Visible for testing
    void clearAll() {
        requestLog.clear();
    }
}
