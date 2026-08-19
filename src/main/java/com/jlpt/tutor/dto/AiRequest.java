package com.jlpt.tutor.dto;

import com.jlpt.tutor.model.AiUseCase;
import com.jlpt.tutor.model.Message;
import com.jlpt.tutor.model.RagDocument;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class AiRequest {
    @NotNull(message = "useCase là bắt buộc (GRAMMAR_EXPLAIN, WRITING_CHECK, QUIZ_EXPLANATION, CONVERSATION, MOCK_ANALYSIS)")
    private AiUseCase useCase;

    private Map<String, String> userContext;
    private Map<String, String> params;
    private List<Message> history;
    private String conversationId;
    private String userId;
    private String model;

    /** Populated by GeminiService before building the prompt; not sent by the client. */
    private List<RagDocument> ragContext;
}
