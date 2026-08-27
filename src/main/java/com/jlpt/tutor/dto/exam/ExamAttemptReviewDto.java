package com.jlpt.tutor.dto.exam;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamAttemptReviewDto {
    private Long attemptId;
    private Long examId;
    private String examCode;
    private String examTitle;
    private String jlptLevel;
    private Integer year;
    private Integer month;

    private Long sectionId;
    private String sectionTitle;
    private Integer mondaiNumber;

    private Integer score;
    private Integer maxScore;
    private Double percentage;
    private Integer correctCount;
    private Integer totalQuestions;
    private Boolean isPassed;
    private Integer timeSpentSeconds;
    private Integer xpEarned;
    private String submittedAt;

    private List<ExamQuestionDto> questions;
}
