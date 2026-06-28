package com.jlpt.tutor.controller;

import com.jlpt.tutor.dto.AiRequest;
import com.jlpt.tutor.dto.AiResponse;
import com.jlpt.tutor.service.GeminiService;
import com.jlpt.tutor.service.OffTopicFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class ChatController {

    private final GeminiService geminiService;
    private final OffTopicFilter offTopicFilter;

    @PostMapping("/chat")
    public AiResponse chat(@RequestBody AiRequest request) {
        String userMessage = extractUserMessage(request);
        
        if (!offTopicFilter.isOnTopic(userMessage)) {
            log.info("Off-topic request detected, useCase={}, message={}", 
                request.getUseCase(), userMessage);
            return AiResponse.fallback(
                "Xin lỗi, tôi chỉ có thể hỗ trợ các câu hỏi liên quan đến tiếng Nhật và luyện thi JLPT. " +
                "Bạn có muốn hỏi gì về ngữ pháp, từ vựng, kanji, hoặc bài tập JLPT không?"
            );
        }
        
        return geminiService.chat(request);
    }

    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chatStream(@RequestBody AiRequest request) {
        String userMessage = extractUserMessage(request);
        
        if (!offTopicFilter.isOnTopic(userMessage)) {
            String fallback = AiResponse.fallback(
                "Xin lỗi, tôi chỉ có thể hỗ trợ các câu hỏi liên quan đến tiếng Nhật và luyện thi JLPT. " +
                "Bạn có muốn hỏi gì về ngữ pháp, từ vựng, kanji, hoặc bài tập JLPT không?"
            ).getMessage();
            return Flux.just(fallback);
        }
        
        return geminiService.chatStream(request);
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
