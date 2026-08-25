package com.jlpt.tutor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JlptLevelConfigDto {
    private Long id;
    private String level;
    private String name;
    private String description;
    private Boolean enabled;
    private Integer orderIndex;
    private LocalDateTime updatedAt;
    private String updatedBy;

    // Content statistics for this level
    private Long vocabularyCount;
    private Long kanjiCount;
    private Long grammarCount;
    private Long lessonCount;
}
