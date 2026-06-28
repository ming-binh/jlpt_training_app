package com.jlpt.tutor.service;

import com.jlpt.tutor.model.AiUseCase;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
public class AiMetricsService {

    public record AiInteractionLog(
        String userId,
        AiUseCase useCase,
        int inputTokens,
        int outputTokens,
        long latencyMs,
        boolean parsedSuccessfully,
        Float userRating,
        String jlptLevel,
        LocalDateTime timestamp
    ) {}

    public void logInteraction(AiInteractionLog interactionLog) {
        // In a real application, we would save this to a database or send it to a monitoring service like Datadog/NewRelic
        log.info("AI Interaction logged: {}", interactionLog);
    }
}
