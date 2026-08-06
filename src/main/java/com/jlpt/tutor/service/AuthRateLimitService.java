package com.jlpt.tutor.service;

import com.jlpt.tutor.exception.RateLimitException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * IP-based rate limiting for pre-auth endpoints (login/register), to slow down
 * credential-stuffing / brute-force attempts. Separate from {@link RateLimitService},
 * which is keyed by authenticated userId and doesn't apply before a session exists.
 */
@Slf4j
@Service
public class AuthRateLimitService {

    private static final int MAX_ATTEMPTS = 10;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private final ConcurrentHashMap<String, ConcurrentLinkedDeque<Instant>> attemptLog = new ConcurrentHashMap<>();

    public void checkRateLimit(String clientIp, String action) {
        String key = clientIp + ":" + action;
        ConcurrentLinkedDeque<Instant> timestamps = attemptLog.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());

        Instant cutoff = Instant.now().minus(WINDOW);
        while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(cutoff)) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= MAX_ATTEMPTS) {
            log.warn("Auth rate limit exceeded for ip={}, action={}, count={}/{}", clientIp, action, timestamps.size(), MAX_ATTEMPTS);
            throw new RateLimitException("Bạn đã thử quá nhiều lần. Vui lòng thử lại sau ít phút.");
        }

        timestamps.addLast(Instant.now());
    }
}
