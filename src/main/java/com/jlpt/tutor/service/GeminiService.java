package com.jlpt.tutor.service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jlpt.tutor.dto.*;
import com.jlpt.tutor.model.AiUseCase;
import com.jlpt.tutor.model.Message;
import com.jlpt.tutor.model.RagDocument;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import io.netty.resolver.DefaultAddressResolverGroup;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import reactor.netty.http.client.HttpClient;

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
    private final EmbeddingService embeddingService;
    private final VectorSearchService vectorSearchService;

    @Value("${GROQ_API_KEY:}")
    private String groqApiKey;

    @Value("${GROQ_MODEL:openai/gpt-oss-120b}")
    private String groqModel;

    @Value("${rag.enabled:false}")
    private boolean ragEnabled;

    @Value("${rag.top-k:3}")
    private int ragTopK;

    private static final int MAX_RETRIES = 2;
    private static final Duration RETRY_DELAY = Duration.ofMillis(500);

    public GeminiService(WebClient webClient,
                         PromptBuilder promptBuilder,
                         @Value("${GEMINI_MODEL:gemini-2.5-flash}") String model,
                         ConversationManager conversationManager,
                         AiMetricsService metricsService,
                         EmbeddingService embeddingService,
                         VectorSearchService vectorSearchService) {
        this.webClient = webClient;
        this.promptBuilder = promptBuilder;
        this.objectMapper = new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        this.model = model;
        this.conversationManager = conversationManager;
        this.metricsService = metricsService;
        this.embeddingService = embeddingService;
        this.vectorSearchService = vectorSearchService;
    }

    public AiResponse chat(AiRequest request) {
        long start = System.currentTimeMillis();
        AiUseCase useCase = request.getUseCase() != null ? request.getUseCase() : AiUseCase.CONVERSATION;

        // RAG enrichment: retrieve relevant knowledge before building the prompt
        if (ragEnabled) {
            enrichWithRagContext(request, useCase);
        }

        String reqModel = request.getModel();
        AiResponse response = null;

        if (reqModel != null && !reqModel.isBlank()) {
            String trimmedModel = reqModel.trim();
            if (trimmedModel.toLowerCase().startsWith("gemini")) {
                response = chatWithGemini(request, useCase, start, trimmedModel);
                if (isErrorFallback(response)) {
                    log.warn("Gemini model {} failed, falling back to Groq openai/gpt-oss-120b", trimmedModel);
                    response = chatWithGroq(request, useCase, start, "openai/gpt-oss-120b");
                }
            } else {
                response = chatWithGroq(request, useCase, start, trimmedModel);
                if (isErrorFallback(response)) {
                    log.warn("Groq model {} failed, falling back to Gemini gemini-2.5-flash", trimmedModel);
                    response = chatWithGemini(request, useCase, start, "gemini-2.5-flash");
                }
            }
        } else {
            response = chatWithGemini(request, useCase, start, this.model);
            if (isErrorFallback(response)) {
                log.warn("Gemini default model {} failed, falling back to Groq openai/gpt-oss-120b", this.model);
                response = chatWithGroq(request, useCase, start, "openai/gpt-oss-120b");
            }
        }

        return (response != null) ? response : AiResponse.fallback("Xin lỗi, Sensei chưa xử lý được câu hỏi. Bạn vui lòng thử lại nhé!");
    }

    private boolean isErrorFallback(AiResponse response) {
        if (response == null || response.getMessage() == null) return true;
        String msg = response.getMessage();
        return msg.contains("Lỗi kết nối") || msg.contains("Không nhận được phản hồi");
    }

    /**
     * Embeds the user's message and retrieves top-K relevant JLPT knowledge documents.
     * Sets ragContext on the request so PromptBuilder can inject it into the prompt.
     * Failures are non-fatal — if embedding or search fails, ragContext remains null.
     */
    private void enrichWithRagContext(AiRequest request, AiUseCase useCase) {
        if (useCase == AiUseCase.WRITING_CHECK || useCase == AiUseCase.MOCK_ANALYSIS) return;

        String userMessage = extractUserMessage(request);
        if (userMessage.isBlank()) return;

        // Search across all JLPT levels (N5-N1) so questions about any kanji, vocab, or grammar find matching DB records
        String jlptLevel = null;

        try {
            float[] queryVector = embeddingService.embed(userMessage);
            if (queryVector == null) return;

            List<RagDocument> docs = vectorSearchService.search(queryVector, userMessage, jlptLevel, ragTopK);
            if (docs != null && !docs.isEmpty()) {
                request.setRagContext(docs);
                log.info("RAG enrichment: {} knowledge docs attached for query='{}'", docs.size(), userMessage);
            }
        } catch (Exception e) {
            log.warn("RAG enrichment failed (non-fatal): {}", e.getMessage());
        }
    }

    private String getCleanGroqApiKey() {
        if (groqApiKey == null) return "";
        return groqApiKey.replaceAll("^[\"']|[\"']$", "").trim();
    }

    private String getCleanGroqModel() {
        if (groqModel == null || groqModel.isBlank()) return "openai/gpt-oss-120b";
        return groqModel.replaceAll("^[\"']|[\"']$", "").trim();
    }

    // ---- Groq AI Engine ----
    private AiResponse chatWithGroq(AiRequest request, AiUseCase useCase, long start, String targetModel) {
        String cleanModel = (targetModel != null && !targetModel.isBlank()) ? targetModel.trim() : getCleanGroqModel();
        String cleanApiKey = getCleanGroqApiKey();
        log.info("Calling Groq AI API with model {}...", cleanModel);
        HttpClient httpClient = HttpClient.create()
                .resolver(DefaultAddressResolverGroup.INSTANCE)
                .responseTimeout(Duration.ofSeconds(30));
        WebClient groqClient = WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();

        List<Map<String, String>> messages = new ArrayList<>();
        String prompt = promptBuilder.build(request);
        messages.add(Map.of("role", "system", "content", prompt + "\n\nCRITICAL: You MUST output your response strictly as a valid JSON object."));

        String userMessage = extractUserMessage(request);
        if (request.getHistory() != null && !request.getHistory().isEmpty()) {
            List<Message> context = conversationManager.buildContext(request.getHistory(), userMessage);
            for (int i = 0; i < context.size(); i++) {
                Message msg = context.get(i);
                String role = "model".equals(msg.getRole()) || "assistant".equals(msg.getRole()) ? "assistant" : "user";
                String content = msg.getContent();
                if (i == context.size() - 1 && "user".equals(role)) {
                    content += "\n(Respond strictly in JSON format)";
                }
                messages.add(Map.of("role", role, "content", content));
            }
        } else {
            messages.add(Map.of("role", "user", "content", userMessage + "\n(Respond strictly in JSON format)"));
        }

        Map<String, Object> body = new HashMap<>();
        body.put("model", cleanModel);
        body.put("messages", messages);
        body.put("temperature", getTemperature(useCase));
        body.put("max_tokens", 2048);
        body.put("response_format", Map.of("type", "json_object"));

        for (int attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                String rawResponse = groqClient.post()
                        .uri("https://api.groq.com/openai/v1/chat/completions")
                        .header("Authorization", "Bearer " + cleanApiKey)
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
    private AiResponse chatWithGemini(AiRequest request, AiUseCase useCase, long start, String targetModel) {
        String effectiveModel = (targetModel != null && !targetModel.isBlank()) ? targetModel.trim() : this.model;
        log.info("Calling Gemini AI API with model {}...", effectiveModel);
        for (int attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                GeminiRequestDto geminiRequest = buildRequest(request, useCase);
                String uri = "/v1beta/models/" + effectiveModel + ":generateContent";

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
        String effectiveModel = (request.getModel() != null && !request.getModel().isBlank()) ? request.getModel().trim() : this.model;
        String uri = "/v1beta/models/" + effectiveModel + ":streamGenerateContent";

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
        String systemPrompt = promptBuilder.build(request);
        Content systemInstruction = Content.builder()
                .parts(List.of(Part.text(systemPrompt)))
                .build();

        String userMessage = extractUserMessage(request);
        List<Content> contents;

        if (request.getHistory() != null && !request.getHistory().isEmpty()) {
            List<Message> context = conversationManager.buildContext(request.getHistory(), userMessage);
            contents = new ArrayList<>();
            for (Message msg : context) {
                String role = mapRole(msg.getRole());
                contents.add(Content.builder()
                        .role(role)
                        .parts(List.of(Part.text(msg.getContent())))
                        .build());
            }
        } else {
            contents = List.of(Content.builder()
                    .role("user")
                    .parts(List.of(Part.text(userMessage)))
                    .build());
        }

        return GeminiRequestDto.builder()
                .systemInstruction(systemInstruction)
                .contents(contents)
                .generationConfig(GenerationConfig.builder()
                        .responseMimeType("application/json")
                        .temperature(getTemperature(useCase))
                        .maxOutputTokens(8192)
                        .build())
                .build();
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
            String cleaned = textContent
                    .replaceAll("(?s)<thinking>.*?</thinking>", "")
                    .replaceAll("(?s)<think>.*?</think>", "")
                    .trim();
            if (cleaned.startsWith("```json")) {
                cleaned = cleaned.substring(7);
            } else if (cleaned.startsWith("```")) {
                cleaned = cleaned.substring(3);
            }
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }
            cleaned = cleaned.trim();

            return objectMapper.readValue(cleaned, AiResponse.class);
        } catch (Exception e) {
            log.warn("Failed to parse JSON into AiResponse, creating direct message wrapper. Raw: {}", textContent);
            return AiResponse.builder()
                    .message(textContent)
                    .build();
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
        if (useCase == null) return 0.5f;
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
        if (request.getParams() != null && !request.getParams().isEmpty()) {
            return String.join(" ", request.getParams().values());
        }
        return "";
    }
}
