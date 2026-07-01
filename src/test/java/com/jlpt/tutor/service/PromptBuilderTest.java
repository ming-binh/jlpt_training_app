package com.jlpt.tutor.service;

import com.jlpt.tutor.dto.AiRequest;
import com.jlpt.tutor.model.AiUseCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PromptBuilderTest {

    private PromptBuilder promptBuilder;
    private PromptVariantService promptVariantService;

    @BeforeEach
    void setUp() {
        promptVariantService = mock(PromptVariantService.class);
        promptBuilder = new PromptBuilder(promptVariantService);
        
        ReflectionTestUtils.setField(promptBuilder, "masterSystemPrompt", 
                new ByteArrayResource("You are an AI Tutor for {{user_name}}.".getBytes(StandardCharsets.UTF_8)));
        ReflectionTestUtils.setField(promptBuilder, "grammarExplainPrompt", 
                new ByteArrayResource("Explain {{grammar_point}} to level {{jlpt_level}}".getBytes(StandardCharsets.UTF_8)));
        ReflectionTestUtils.setField(promptBuilder, "offTopicResponse", 
                new ByteArrayResource("{\"error\":\"off-topic\"}".getBytes(StandardCharsets.UTF_8)));
        ReflectionTestUtils.setField(promptBuilder, "uncertaintyResponse", 
                new ByteArrayResource("".getBytes(StandardCharsets.UTF_8)));
        ReflectionTestUtils.setField(promptBuilder, "grammarExamplesPrompt", 
                new ByteArrayResource("".getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void testBuild_GrammarExplain() {
        AiRequest request = new AiRequest();
        request.setUseCase(AiUseCase.GRAMMAR_EXPLAIN);
        request.setUserContext(Map.of("user_name", "Minh"));
        request.setParams(Map.of("grammar_point", "〜てもいいですか", "jlpt_level", "N4"));

        when(promptVariantService.selectPromptVariant(anyString(), anyString())).thenReturn(null); // use fallback

        String result = promptBuilder.build(request);

        assertTrue(result.contains("You are an AI Tutor for Minh."));
        assertTrue(result.contains("Explain 〜てもいいですか to level N4"));
        assertTrue(result.contains("{\"error\":\"off-topic\"}"));
    }
}
