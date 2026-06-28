package com.jlpt.tutor.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class GeminiRequestDto {
    private List<Content> contents;
    private GenerationConfig generationConfig;
}
