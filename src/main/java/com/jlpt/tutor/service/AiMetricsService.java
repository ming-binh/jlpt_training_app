package com.jlpt.tutor.service;

import com.jlpt.tutor.entity.InteractionLog;
import com.jlpt.tutor.model.AiUseCase;
import com.jlpt.tutor.repository.InteractionLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiMetricsService {

    private final InteractionLogRepository interactionLogRepository;

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

    public void logInteraction(AiInteractionLog interaction) {
        log.info("AI Interaction logged: {}", interaction);

        try {
            InteractionLog entity = InteractionLog.builder()
                    .userId(interaction.userId())
                    .useCase(interaction.useCase() != null ? interaction.useCase().name() : null)
                    .inputTokens(interaction.inputTokens())
                    .outputTokens(interaction.outputTokens())
                    .latencyMs(interaction.latencyMs())
                    .parsedSuccessfully(interaction.parsedSuccessfully())
                    .userRating(interaction.userRating())
                    .jlptLevel(interaction.jlptLevel())
                    .build();
            interactionLogRepository.save(entity);
        } catch (Exception e) {
            // Don't let metrics persistence failure break the main flow
            log.error("Failed to persist interaction log: {}", e.getMessage());
        }
    }
}
