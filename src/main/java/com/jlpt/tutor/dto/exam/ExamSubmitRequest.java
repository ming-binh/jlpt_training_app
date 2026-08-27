package com.jlpt.tutor.dto.exam;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamSubmitRequest {
    /** Optional sectionId if submitting only a single Mondai practice */
    private Long sectionId;

    /** Map of questionId -> selectedOption (1..4) */
    private Map<Long, Integer> answers;

    /** Total time user spent in seconds */
    private Integer timeSpentSeconds;
}
