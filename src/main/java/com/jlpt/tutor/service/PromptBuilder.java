package com.jlpt.tutor.service;

import com.jlpt.tutor.dto.AiRequest;
import com.jlpt.tutor.model.AiUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PromptBuilder {

    private final PromptVariantService promptVariantService;

    @Value("classpath:prompts/master_system.txt")
    private Resource masterSystemPrompt;

    @Value("classpath:prompts/grammar_explain.txt")
    private Resource grammarExplainPrompt;

    @Value("classpath:prompts/writing_check.txt")
    private Resource writingCheckPrompt;

    @Value("classpath:prompts/quiz_explanation.txt")
    private Resource quizExplanationPrompt;

    @Value("classpath:prompts/conversation.txt")
    private Resource conversationPrompt;

    @Value("classpath:prompts/mock_analysis.txt")
    private Resource mockAnalysisPrompt;

    @Value("classpath:prompts/few_shot/grammar_examples.txt")
    private Resource grammarExamplesPrompt;

    @Value("classpath:prompts/few_shot/writing_examples.txt")
    private Resource writingExamplesPrompt;

    @Value("classpath:prompts/few_shot/quiz_examples.txt")
    private Resource quizExamplesPrompt;

    @Value("classpath:prompts/guardrails/off_topic_response.txt")
    private Resource offTopicResponse;

    @Value("classpath:prompts/guardrails/uncertainty_response.txt")
    private Resource uncertaintyResponse;

    public String build(AiRequest request) {
        String master = loadAndFill(masterSystemPrompt, request.getUserContext());
        String template = loadTemplate(request.getUseCase(), request.getUserId());
        String filled = fillTemplate(template, request.getParams());

        String guardrails = loadGuardrails();
        String fewShot = request.getUseCase().needsFewShot() ? loadFewShot(request.getUseCase()) : "";

        return String.join("\n\n", master, guardrails, fewShot, filled);
    }

    private String loadAndFill(Resource resource, Map<String, String> params) {
        return fillTemplate(readResource(resource), params);
    }

    private String loadTemplate(AiUseCase useCase, String userId) {
        // Try getting a variant first (A/B testing)
        String variant = promptVariantService.selectPromptVariant(useCase.name(), userId);
        if (variant != null) {
            return variant;
        }
        
        // Fallback to default file resources
        return switch (useCase) {
            case GRAMMAR_EXPLAIN -> readResource(grammarExplainPrompt);
            case WRITING_CHECK -> readResource(writingCheckPrompt);
            case QUIZ_EXPLANATION -> readResource(quizExplanationPrompt);
            case CONVERSATION -> readResource(conversationPrompt);
            case MOCK_ANALYSIS -> readResource(mockAnalysisPrompt);
        };
    }

    private String loadFewShot(AiUseCase useCase) {
        return switch (useCase) {
            case GRAMMAR_EXPLAIN -> readResource(grammarExamplesPrompt);
            case WRITING_CHECK -> readResource(writingExamplesPrompt);
            case QUIZ_EXPLANATION -> readResource(quizExamplesPrompt);
            default -> "";
        };
    }

    private String loadGuardrails() {
        StringBuilder sb = new StringBuilder();
        String offTopic = readResource(offTopicResponse);
        String uncertainty = readResource(uncertaintyResponse);

        if (!uncertainty.isEmpty()) {
            sb.append("GUARDRAIL - KHÔNG HALLUCINATE:\n").append(uncertainty).append("\n");
        }
        if (!offTopic.isEmpty()) {
            sb.append("Nếu câu hỏi KHÔNG liên quan đến tiếng Nhật/JLPT, " +
                    "trả lời EXACTLY theo JSON sau, không thêm bất kỳ text nào khác:\n")
                    .append(offTopic);
        }
        return sb.toString();
    }

    private String fillTemplate(String template, Map<String, String> params) {
        if (template == null || template.isEmpty()) return "";
        if (params == null) return template;
        
        String result = template;
        for (Map.Entry<String, String> entry : params.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", sanitize(entry.getValue()));
        }
        if (result.contains("{{")) {
            log.warn("Unfilled placeholders in prompt: {}", result.replaceAll("[^{]*\\{\\{([^}]+)\\}\\}[^{]*", "{{$1}}"));
        }
        return result;
    }

    private String sanitize(String input) {
        if (input == null) return "";
        return input
            .replace("{{", "【【")
            .replace("}}", "】】")
            .replace("[SYSTEM]", "")
            .replace("[TASK]", "")
            .trim();
    }

    private String readResource(Resource resource) {
        if (resource == null || !resource.exists()) return "";
        try {
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Failed to read resource", e);
            return "";
        }
    }
}
