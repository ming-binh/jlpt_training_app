package com.jlpt.tutor.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class LessonDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LessonResponse {
        private Long id;
        private String title;
        private String description;
        private String jlptLevel;
        private String contentType;
        private Integer orderIndex;
        private Integer itemCount;
        private Integer completedCount;
        private String status; // locked | available | in-progress | completed
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompleteRequest {
        @JsonProperty("lessonId")
        private Long lessonId;

        private List<QuizResultDto> results;
        private Long totalTimeMs;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompleteResponse {
        private Integer xpEarned;
        private Integer correctCount;
        private Integer totalCount;
        private Integer score;
        private Boolean streakUpdated;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizResultDto {
        private String exerciseId;
        private String userAnswer;
        private Boolean correct;
        private Long timeMs;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgressSummary {
        private Integer streak;
        private Integer xp;
        private Integer xpToNextLevel;
        private Integer masteredVocab;
        private Integer masteredKanji;
        private Integer masteredGrammar;
        private Boolean todayGoalComplete;
        private String jlptLevel;
    }
}
