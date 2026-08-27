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
public class ExamSectionDto {
    private Long id;
    private Long examId;
    private String sectionType; // VOCABULARY, GRAMMAR, READING, LISTENING
    private Integer mondaiNumber;
    private String title;
    private String instruction;
    private String passageText;
    private String audioUrl;
    private Integer timeLimitMinutes;
    private Integer orderIndex;
    private Integer questionCount;

    // User section stats
    private Integer userBestScore;
    private Integer userMaxScore;
    private Boolean userPassed;

    private List<ExamQuestionDto> questions;
}
