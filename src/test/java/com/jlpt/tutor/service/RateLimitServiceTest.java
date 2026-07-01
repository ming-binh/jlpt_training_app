package com.jlpt.tutor.service;

import com.jlpt.tutor.config.RateLimitConfig;
import com.jlpt.tutor.exception.RateLimitException;
import com.jlpt.tutor.model.AiUseCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RateLimitServiceTest {

    private RateLimitService rateLimitService;
    private RateLimitConfig config;

    @BeforeEach
    void setUp() {
        config = new RateLimitConfig();
        config.setChatPerMinute(3);
        config.setWritingCheckPerDay(2);
        config.setConversationPerDay(2);
        config.setExplanationPerDay(5);
        rateLimitService = new RateLimitService(config);
    }

    @Test
    void testWithinLimit_NoException() {
        assertDoesNotThrow(() ->
            rateLimitService.checkRateLimit("user-001", AiUseCase.GRAMMAR_EXPLAIN));
    }

    @Test
    void testExceedLimit_ThrowsException() {
        // Config: conversationPerDay = 2
        rateLimitService.checkRateLimit("user-001", AiUseCase.CONVERSATION);
        rateLimitService.checkRateLimit("user-001", AiUseCase.CONVERSATION);

        RateLimitException ex = assertThrows(RateLimitException.class, () ->
            rateLimitService.checkRateLimit("user-001", AiUseCase.CONVERSATION));
        assertTrue(ex.getMessage().contains("CONVERSATION"));
    }

    @Test
    void testDifferentUsers_IndependentLimits() {
        rateLimitService.checkRateLimit("user-001", AiUseCase.CONVERSATION);
        rateLimitService.checkRateLimit("user-001", AiUseCase.CONVERSATION);

        // user-002 should still be able to make requests
        assertDoesNotThrow(() ->
            rateLimitService.checkRateLimit("user-002", AiUseCase.CONVERSATION));
    }

    @Test
    void testDifferentUseCases_IndependentLimits() {
        rateLimitService.checkRateLimit("user-001", AiUseCase.CONVERSATION);
        rateLimitService.checkRateLimit("user-001", AiUseCase.CONVERSATION);

        // Same user, different use case should still work
        assertDoesNotThrow(() ->
            rateLimitService.checkRateLimit("user-001", AiUseCase.GRAMMAR_EXPLAIN));
    }

    @Test
    void testNullUserId_SkipsRateLimit() {
        // Should not throw for null/blank userId
        assertDoesNotThrow(() ->
            rateLimitService.checkRateLimit(null, AiUseCase.CONVERSATION));
        assertDoesNotThrow(() ->
            rateLimitService.checkRateLimit("", AiUseCase.CONVERSATION));
    }

    @Test
    void testWritingCheck_UsesOwnLimit() {
        // Config: writingCheckPerDay = 2
        rateLimitService.checkRateLimit("user-001", AiUseCase.WRITING_CHECK);
        rateLimitService.checkRateLimit("user-001", AiUseCase.WRITING_CHECK);

        assertThrows(RateLimitException.class, () ->
            rateLimitService.checkRateLimit("user-001", AiUseCase.WRITING_CHECK));
    }
}
