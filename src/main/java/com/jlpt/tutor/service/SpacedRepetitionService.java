package com.jlpt.tutor.service;

import com.jlpt.tutor.entity.UserProgress;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Simplified SM-2 spaced repetition scheduler.
 * Uses binary correct/incorrect grading instead of SM-2's 0-5 quality scale:
 * correct maps to a "good" review (q=4), incorrect resets the item like q<3 does in classic SM-2.
 */
@Service
public class SpacedRepetitionService {

    private static final double MIN_EASE_FACTOR = 1.3;
    private static final double DEFAULT_EASE_FACTOR = 2.5;
    private static final int DEFAULT_INTERVAL_DAYS = 1;

    /**
     * Updates reviewCount, lastReviewDate, easeFactor, intervalDays and nextReviewDate
     * on the given progress based on whether the review was answered correctly.
     * Does not touch status/xp — callers own that semantics.
     */
    public void applyReview(UserProgress progress, boolean correct) {
        int reviewCount = progress.getReviewCount() != null ? progress.getReviewCount() : 0;
        double easeFactor = progress.getEaseFactor() != null ? progress.getEaseFactor() : DEFAULT_EASE_FACTOR;
        int intervalDays = progress.getIntervalDays() != null ? progress.getIntervalDays() : DEFAULT_INTERVAL_DAYS;

        reviewCount += 1;

        if (correct) {
            easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor + 0.1);
            intervalDays = switch (reviewCount) {
                case 1 -> 1;
                case 2 -> 6;
                default -> (int) Math.round(intervalDays * easeFactor);
            };
        } else {
            easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
            intervalDays = DEFAULT_INTERVAL_DAYS;
        }

        progress.setReviewCount(reviewCount);
        progress.setLastReviewDate(LocalDateTime.now());
        progress.setEaseFactor(easeFactor);
        progress.setIntervalDays(intervalDays);
        progress.setNextReviewDate(LocalDateTime.now().plusDays(intervalDays));
    }
}
