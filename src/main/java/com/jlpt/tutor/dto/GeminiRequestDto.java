package com.jlpt.tutor.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GeminiRequestDto {
    @JsonProperty("system_instruction")
    private Content systemInstruction;
    private List<Content> contents;
    private GenerationConfig generationConfig;
}
