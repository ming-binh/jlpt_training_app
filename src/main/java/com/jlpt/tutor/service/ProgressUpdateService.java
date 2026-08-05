package com.jlpt.tutor.service;

import com.jlpt.tutor.dto.LessonDto;
import com.jlpt.tutor.entity.UserProgress;
import com.jlpt.tutor.repository.UserProgressRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Applies a batch of quiz/exercise results to UserProgress: updates status,
 * SM-2 scheduling and XP. Shared by lesson completion and practice/review submission.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProgressUpdateService {

    private static final int XP_PER_CORRECT = 10;

    private final UserProgressRepository userProgressRepository;
    private final SpacedRepetitionService spacedRepetitionService;

    public record ResultSummary(int correctCount, int totalCount) {}

    public ResultSummary applyResults(String userId, List<LessonDto.QuizResultDto> results) {
        int correctCount = 0;

        for (LessonDto.QuizResultDto result : results) {
            if (result.getEntityType() == null || result.getEntityId() == null) {
                continue;
            }

            boolean correct = Boolean.TRUE.equals(result.getCorrect());
            if (correct) {
                correctCount++;
            }

            try {
                UserProgress.EntityType type = UserProgress.EntityType.valueOf(result.getEntityType());
                UserProgress progress = userProgressRepository
                        .findByUserIdAndEntityTypeAndEntityId(userId, type, result.getEntityId())
                        .orElse(UserProgress.builder()
                                .userId(userId)
                                .entityType(type)
                                .entityId(result.getEntityId())
                                .reviewCount(0)
                                .xp(0)
                                .build());

                progress.setStatus(correct ? UserProgress.ProgressStatus.MASTERED : UserProgress.ProgressStatus.LEARNING);
                spacedRepetitionService.applyReview(progress, correct);
                if (correct) {
                    progress.setXp(progress.getXp() + XP_PER_CORRECT);
                }
                userProgressRepository.save(progress);
            } catch (Exception e) {
                log.warn("Failed to save progress result for item {}", result.getEntityId(), e);
            }
        }

        return new ResultSummary(correctCount, results.size());
    }
}
