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
public class ExamDto {
    private Long id;
    private String code;
    private String title;
    private String jlptLevel;
    private Integer year;
    private Integer month;
    private Integer totalTimeMinutes;
    private Integer totalQuestions;
    private String description;
    private Boolean isPublished;

    // User-specific attempt stats
    private Integer userBestScore;
    private Integer userMaxScore;
    private Boolean userPassed;
    private Integer userAttemptCount;
    private String lastAttemptDate;

    private List<ExamSectionDto> sections;
}
