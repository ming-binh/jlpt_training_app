package com.jlpt.tutor.service;

import com.jlpt.tutor.dto.AiRequest;
import com.jlpt.tutor.dto.AiResponse;
import com.jlpt.tutor.model.AiUseCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GeminiServiceTest {

    @Mock
    private PromptBuilder promptBuilder;
    @Mock
    private ConversationManager conversationManager;
    @Mock
    private AiMetricsService metricsService;
    
    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private WebClient webClient;

    private GeminiService geminiService;

    @BeforeEach
    void setUp() {
        geminiService = new GeminiService(webClient, promptBuilder, "gemini-1.5-flash", conversationManager, metricsService);
    }

    @Test
    void testChat_Success() {
        AiRequest request = new AiRequest();
        request.setUseCase(AiUseCase.GRAMMAR_EXPLAIN);

        when(promptBuilder.build(request)).thenReturn("Mocked prompt");

        String fakeJsonResponse = "{" +
                "\"candidates\": [ {" +
                "  \"content\": {" +
                "    \"parts\": [ {" +
                "      \"text\": \"{\\\"message\\\": \\\"Giải thích mock\\\", \\\"success\\\": true}\"" +
                "    } ]" +
                "  }" +
                "} ]" +
                "}";

        when(webClient.post()
                .uri(anyString())
                .bodyValue(any())
                .retrieve()
                .bodyToMono(String.class)
                .block(any(Duration.class)))
                .thenReturn(fakeJsonResponse);

        AiResponse response = geminiService.chat(request);

        assertNotNull(response);
        assertEquals("Giải thích mock", response.getMessage());
        verify(metricsService, times(1)).logInteraction(any());
    }
}
