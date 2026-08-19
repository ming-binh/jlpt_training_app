package com.jlpt.tutor.service;

import com.jlpt.tutor.dto.AiRequest;
import com.jlpt.tutor.model.AiUseCase;
import com.jlpt.tutor.model.RagDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    @Value("classpath:prompts/rag_context_block.txt")
    private Resource ragContextTemplate;

    public String build(AiRequest request) {
        Map<String, String> userContext = request.getUserContext() != null ? new HashMap<>(request.getUserContext()) : new HashMap<>();
        userContext.putIfAbsent("user_name", "Học viên");
        userContext.putIfAbsent("jlpt_level", "N4");
        userContext.putIfAbsent("last_mock_score", "Chưa có");
        userContext.putIfAbsent("weak_sections", "Đang cập nhật");
        userContext.putIfAbsent("streak_days", "1");

        Map<String, String> params = request.getParams() != null ? new HashMap<>(request.getParams()) : new HashMap<>();
        params.putIfAbsent("jlpt_level", userContext.get("jlpt_level"));
        params.putIfAbsent("user_message", "");
        params.putIfAbsent("grammar_point", params.get("user_message"));
        params.putIfAbsent("scenario", "Hỏi đáp kiến thức tiếng Nhật và luyện thi JLPT");
        params.putIfAbsent("ai_role", "Sensei (Gia sư tiếng Nhật)");
        params.putIfAbsent("user_role", "Học viên");

        String master = loadAndFill(masterSystemPrompt, userContext);
        String template = loadTemplate(request.getUseCase(), request.getUserId());
        String filled = fillTemplate(template, params);

        String ragBlock = buildRagBlock(request.getRagContext());
        String guardrails = loadGuardrails();
        String fewShot = (request.getUseCase() != null && request.getUseCase().needsFewShot())
                ? loadFewShot(request.getUseCase()) : "";

        if (ragBlock.isEmpty()) {
            return String.join("\n\n", master, guardrails, fewShot, filled);
        }
        return String.join("\n\n", master, ragBlock, guardrails, fewShot, filled);
    }

    private String buildRagBlock(List<RagDocument> ragContext) {
        if (ragContext == null || ragContext.isEmpty()) return "";
        String entries = ragContext.stream()
                .map(RagDocument::toPromptLine)
                .collect(Collectors.joining("\n"));
        String template = readResource(ragContextTemplate);
        return template.replace("{{rag_entries}}", entries);
    }

    private String loadAndFill(Resource resource, Map<String, String> params) {
        return fillTemplate(readResource(resource), params);
    }

    private String loadTemplate(AiUseCase useCase, String userId) {
        if (useCase == null) useCase = AiUseCase.CONVERSATION;
        
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
        if (useCase == null) return "";
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
