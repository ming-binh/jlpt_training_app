package com.jlpt.tutor.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminContentItemDto {
    private String id;
    private String type; // LESSON, VOCAB, KANJI, GRAMMAR
    private String title;
    private String level;
    private Integer itemCount; // only meaningful for LESSON
    private Boolean published; // only meaningful for LESSON
}
