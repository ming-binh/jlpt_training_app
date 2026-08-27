package com.jlpt.tutor.dto.exam;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExamQuestionDto {
    private Long id;
    private Long sectionId;
    private Integer questionNumber;
    private String questionText;
    private String underlinedText;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private Integer scoreWeight;
    private Integer orderIndex;

    // Only included in Review / Result mode, omitted during Taking mode
    private Integer correctOption;
    private String explanation;

    // User's answer when reviewing
    private Integer userSelectedOption;
    private Boolean isCorrect;
}
