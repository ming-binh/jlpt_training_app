package com.jlpt.tutor.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GenerationConfig {
    private String responseMimeType;
    private Float temperature;
    private Integer maxOutputTokens;
}
