package com.jlpt.tutor.controller;

import com.jlpt.tutor.dto.AiRequest;
import com.jlpt.tutor.dto.AiResponse;
import com.jlpt.tutor.entity.Conversation;
import com.jlpt.tutor.model.Message;
import com.jlpt.tutor.service.ConversationService;
import com.jlpt.tutor.service.GeminiService;
import com.jlpt.tutor.service.OffTopicFilter;
import com.jlpt.tutor.service.RateLimitService;
import com.jlpt.tutor.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class ChatController {

    private final GeminiService geminiService;
    private final OffTopicFilter offTopicFilter;
    private final ConversationService conversationService;
    private final UserService userService;
    private final RateLimitService rateLimitService;

    @PostMapping("/chat")
    public AiResponse chat(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody AiRequest request) {

        enrichRequest(userId, request);
        String userMessage = extractUserMessage(request);

        if (!offTopicFilter.isOnTopic(userMessage)) {
            log.info("Off-topic request detected, useCase={}, message={}",
                request.getUseCase(), userMessage);
            return AiResponse.fallback(
                "Xin lỗi, tôi chỉ có thể hỗ trợ các câu hỏi liên quan đến tiếng Nhật và luyện thi JLPT. " +
                "Bạn có muốn hỏi gì về ngữ pháp, từ vựng, kanji, hoặc bài tập JLPT không?"
            );
        }

        // Rate limit check (after off-topic so rejected messages don't count)
        rateLimitService.checkRateLimit(userId, request.getUseCase());

        // Ensure we have a conversation to persist messages
        String conversationId = resolveConversationId(userId, request);

        // Save user message
        if (conversationId != null) {
            conversationService.saveMessage(conversationId, "user", userMessage);
        }

        AiResponse response = geminiService.chat(request);

        // Save AI response
        if (conversationId != null && response.getMessage() != null) {
            conversationService.saveMessage(conversationId, "model", response.getMessage());
        }

        return response;
    }

    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chatStream(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody AiRequest request) {

        enrichRequest(userId, request);
        String userMessage = extractUserMessage(request);

        if (!offTopicFilter.isOnTopic(userMessage)) {
            String fallback = AiResponse.fallback(
                "Xin lỗi, tôi chỉ có thể hỗ trợ các câu hỏi liên quan đến tiếng Nhật và luyện thi JLPT. " +
                "Bạn có muốn hỏi gì về ngữ pháp, từ vựng, kanji, hoặc bài tập JLPT không?"
            ).getMessage();
            return Flux.just(fallback);
        }

        rateLimitService.checkRateLimit(userId, request.getUseCase());

        return geminiService.chatStream(request);
    }

    /**
     * Enrich the request with user context from DB and conversation history if available.
     */
    private void enrichRequest(String userId, AiRequest request) {
        if (userId != null && !userId.isBlank()) {
            request.setUserId(userId);
        }
        
        // Auto-fill userContext from DB if not provided by frontend
        if (userId != null && !userId.isBlank()
                && (request.getUserContext() == null || request.getUserContext().isEmpty())) {
            Map<String, String> context = userService.buildUserContext(userId);
            if (!context.isEmpty()) {
                request.setUserContext(context);
            }
        }

        // Load conversation history from DB if conversationId is provided but history is empty
        if (request.getConversationId() != null && !request.getConversationId().isBlank()
                && (request.getHistory() == null || request.getHistory().isEmpty())) {
            List<Message> history = conversationService.getHistory(request.getConversationId());
            if (!history.isEmpty()) {
                request.setHistory(history);
            }
        }
    }

    /**
     * Resolve or create a conversation ID for message persistence.
     */
    private String resolveConversationId(String userId, AiRequest request) {
        if (request.getConversationId() != null && !request.getConversationId().isBlank()) {
            return request.getConversationId();
        }
        if (userId != null && !userId.isBlank()) {
            Conversation conversation = conversationService.createConversation(userId);
            request.setConversationId(conversation.getId());
            return conversation.getId();
        }
        return null;
    }

    /** Extract the user's actual message from the request, using params if available. */
    private String extractUserMessage(AiRequest request) {
        if (request.getParams() != null && request.getParams().containsKey("user_message")) {
            return request.getParams().get("user_message");
        }
        if (request.getParams() != null) {
            return String.join(" ", request.getParams().values());
        }
        return "";
    }
}
