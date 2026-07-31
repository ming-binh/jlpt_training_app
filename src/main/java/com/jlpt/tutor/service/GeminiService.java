package com.jlpt.tutor.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jlpt.tutor.dto.*;
import com.jlpt.tutor.exception.AiResponseException;
import com.jlpt.tutor.model.AiUseCase;
import com.jlpt.tutor.model.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeminiService {

    private final WebClient webClient;
    private final PromptBuilder promptBuilder;
    private final ObjectMapper objectMapper;
    private final String model;
    private final ConversationManager conversationManager;
    private final AiMetricsService metricsService;

    @Value("${GROQ_API_KEY:}")
    private String groqApiKey;

    @Value("${GROQ_MODEL:llama-3.3-70b-versatile}")
    private String groqModel;

    private static final int MAX_RETRIES = 2;
    private static final Duration RETRY_DELAY = Duration.ofMillis(500);

    public GeminiService(WebClient webClient,
                         PromptBuilder promptBuilder,
                         @Value("${GEMINI_MODEL:gemini-1.5-flash}") String model,
                         ConversationManager conversationManager,
                         AiMetricsService metricsService) {
        this.webClient = webClient;
        this.promptBuilder = promptBuilder;
        this.objectMapper = new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        this.model = model;
        this.conversationManager = conversationManager;
        this.metricsService = metricsService;
    }

    public AiResponse chat(AiRequest request) {
        long start = System.currentTimeMillis();
        AiUseCase useCase = request.getUseCase() != null ? request.getUseCase() : AiUseCase.CONVERSATION;

        // If Groq API key is present and valid, use Groq
        if (groqApiKey != null && groqApiKey.startsWith("gsk_")) {
            return chatWithGroq(request, useCase, start);
        }

        // Fallback to Gemini
        return chatWithGemini(request, useCase, start);
    }

    // ---- Groq AI Engine ----
    private AiResponse chatWithGroq(AiRequest request, AiUseCase useCase, long start) {
        log.info("Calling Groq AI API with model {}...", groqModel);
        WebClient groqClient = WebClient.builder().build();

        List<Map<String, String>> messages = new ArrayList<>();
        String prompt = promptBuilder.build(request);
        messages.add(Map.of("role", "system", "content", prompt + "\n\nCRITICAL: You MUST output your response strictly as a valid JSON object."));

        if (useCase == AiUseCase.CONVERSATION && request.getHistory() != null && !request.getHistory().isEmpty()) {
            String userMessage = extractUserMessage(request);
            List<Message> context = conversationManager.buildContext(request.getHistory(), userMessage);
            for (Message msg : context) {
                String role = "model".equals(msg.getRole()) || "assistant".equals(msg.getRole()) ? "assistant" : "user";
                messages.add(Map.of("role", role, "content", msg.getContent()));
            }
        }

        Map<String, Object> body = new HashMap<>();
        body.put("model", groqModel);
        body.put("messages", messages);
        body.put("temperature", getTemperature(useCase));
        body.put("response_format", Map.of("type", "json_object"));

        for (int attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                String rawResponse = groqClient.post()
                        .uri("https://api.groq.com/openai/v1/chat/completions")
                        .header("Authorization", "Bearer " + groqApiKey)
                        .header("Content-Type", "application/json")
                        .bodyValue(body)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block(Duration.ofSeconds(30));

                String content = extractTextFromGroqResponse(rawResponse);
                AiResponse response = parseAndValidateContent(content);
                if (response != null) {
                    long elapsed = System.currentTimeMillis() - start;
                    metricsService.logInteraction(new AiMetricsService.AiInteractionLog(
                            "default", useCase, 0, 0, elapsed, true, null, null, null));
                    return response;
                }
            } catch (Exception e) {
                log.error("Groq API error, attempt {}/{}: {}", attempt + 1, MAX_RETRIES + 1, e.getMessage());
            }
        }

        long elapsed = System.currentTimeMillis() - start;
        metricsService.logInteraction(new AiMetricsService.AiInteractionLog(
                "default", useCase, 0, 0, elapsed, false, null, null, null));
        return AiResponse.fallback("Lỗi kết nối Groq AI service. Vui lòng thử lại sau.");
    }

    // ---- Gemini AI Engine ----
    private AiResponse chatWithGemini(AiRequest request, AiUseCase useCase, long start) {
        for (int attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                GeminiRequestDto geminiRequest = buildRequest(request, useCase);
                String uri = "/v1beta/models/" + model + ":generateContent";

                String rawResponse = webClient.post()
                        .uri(uri)
                        .bodyValue(geminiRequest)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block(Duration.ofSeconds(90));

                AiResponse response = parseAndValidate(rawResponse);
                if (response == null) {
                    if (attempt < MAX_RETRIES) {
                        Thread.sleep(RETRY_DELAY.toMillis());
                        continue;
                    }
                    long elapsed = System.currentTimeMillis() - start;
                    metricsService.logInteraction(new AiMetricsService.AiInteractionLog(
                            "default", useCase, 0, 0, elapsed, false, null, null, null));
                    return AiResponse.fallback("Không nhận được phản hồi từ AI.");
                }

                long elapsed = System.currentTimeMillis() - start;
                metricsService.logInteraction(new AiMetricsService.AiInteractionLog(
                        "default", useCase, 0, 0, elapsed, true, null, null, null));
                return response;

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                log.error("Gemini API error, attempt {}/{}: {}", attempt + 1, MAX_RETRIES + 1, e.getMessage());
                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(RETRY_DELAY.toMillis());
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        long elapsed = System.currentTimeMillis() - start;
        metricsService.logInteraction(new AiMetricsService.AiInteractionLog(
                "default", useCase, 0, 0, elapsed, false, null, null, null));
        return AiResponse.fallback("Lỗi kết nối đến AI service. Vui lòng thử lại sau.");
    }

    public Flux<String> chatStream(AiRequest request) {
        AiUseCase useCase = request.getUseCase() != null ? request.getUseCase() : AiUseCase.CONVERSATION;
        GeminiRequestDto geminiRequest = buildRequest(request, useCase);
        String uri = "/v1beta/models/" + model + ":streamGenerateContent";

        return webClient.post()
                .uri(uri)
                .bodyValue(geminiRequest)
                .retrieve()
                .bodyToFlux(String.class)
                .map(this::extractTextChunk)
                .filter(text -> text != null && !text.isBlank())
                .onErrorResume(e -> {
                    log.error("Stream error: {}", e.getMessage());
                    return Flux.just("{\"message\":\"Stream error. Vui lòng thử lại.\"}");
                });
    }

    // ---- Helpers ----

    private GeminiRequestDto buildRequest(AiRequest request, AiUseCase useCase) {
        List<Content> contents;

        if (useCase == AiUseCase.CONVERSATION && request.getHistory() != null && !request.getHistory().isEmpty()) {
            contents = buildConversationContents(request);
        } else {
            String prompt = promptBuilder.build(request);
            contents = List.of(Content.builder()
                    .role("user")
                    .parts(List.of(Part.text(prompt)))
                    .build());
        }

        return GeminiRequestDto.builder()
                .contents(contents)
                .generationConfig(GenerationConfig.builder()
                        .responseMimeType("application/json")
                        .temperature(getTemperature(useCase))
                        .maxOutputTokens(2048)
                        .build())
                .build();
    }

    private List<Content> buildConversationContents(AiRequest request) {
        String userMessage = extractUserMessage(request);
        List<Message> context = conversationManager.buildContext(request.getHistory(), userMessage);
        List<Content> contents = new ArrayList<>();
        for (Message msg : context) {
            String role = mapRole(msg.getRole());
            contents.add(Content.builder()
                    .role(role)
                    .parts(List.of(Part.text(msg.getContent())))
                    .build());
        }
        return contents;
    }

    private String mapRole(String role) {
        if ("model".equals(role) || "assistant".equals(role)) return "model";
        if ("system".equals(role)) return "user";
        return "user";
    }

    private AiResponse parseAndValidate(String raw) {
        String textContent = extractTextFromGeminiResponse(raw);
        return parseAndValidateContent(textContent);
    }

    private AiResponse parseAndValidateContent(String textContent) {
        if (textContent == null || textContent.isBlank()) {
            log.warn("Empty text content from AI response");
            return null;
        }
        try {
            String cleaned = textContent.replaceAll("<thinking>[\\s\\S]*?</thinking>", "").trim();
            AiResponse response = objectMapper.readValue(cleaned, AiResponse.class);
            if (response.getMessage() == null || response.getMessage().isBlank()) {
                throw new AiResponseException("Empty message from AI");
            }
            return response;
        } catch (AiResponseException e) {
            log.error("Validation error: {}", e.getMessage());
            return null;
        } catch (JsonProcessingException e) {
            log.error("Failed to parse AI response as JSON: {}", e.getMessage());
            try {
                String cleaned = textContent.replaceAll("<thinking>[\\s\\S]*?</thinking>", "").trim();
                return objectMapper.readValue(
                        "{\"message\":\"" + escapeJson(cleaned) + "\"}",
                        AiResponse.class);
            } catch (Exception ex) {
                return null;
            }
        } catch (Exception e) {
            log.error("Unexpected error parsing AI response: {}", e.getMessage());
            return null;
        }
    }

    private String extractTextFromGeminiResponse(String raw) {
        try {
            return objectMapper.readTree(raw)
                    .path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text").asText();
        } catch (Exception e) {
            return raw;
        }
    }

    private String extractTextFromGroqResponse(String raw) {
        try {
            JsonNode root = objectMapper.readTree(raw);
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            return raw;
        }
    }

    private String extractTextChunk(String rawChunk) {
        return extractTextFromGeminiResponse(rawChunk);
    }

    private float getTemperature(AiUseCase useCase) {
        return switch (useCase) {
            case GRAMMAR_EXPLAIN -> 0.3f;
            case WRITING_CHECK -> 0.2f;
            case QUIZ_EXPLANATION -> 0.3f;
            case CONVERSATION -> 0.7f;
            case MOCK_ANALYSIS -> 0.4f;
        };
    }

    private String extractUserMessage(AiRequest request) {
        if (request.getParams() != null && request.getParams().containsKey("user_message")) {
            return request.getParams().get("user_message");
        }
        if (request.getParams() != null) {
            return String.join(" ", request.getParams().values());
        }
        return "";
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
