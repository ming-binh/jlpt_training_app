package com.jlpt.tutor.dto;

import com.jlpt.tutor.model.AiUseCase;
import com.jlpt.tutor.model.Message;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class AiRequest {
    private AiUseCase useCase;
    private Map<String, String> userContext;
    private Map<String, String> params;
    private List<Message> history;
}
