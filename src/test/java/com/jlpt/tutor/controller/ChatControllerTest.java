package com.jlpt.tutor.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jlpt.tutor.dto.AiRequest;
import com.jlpt.tutor.dto.AiResponse;
import com.jlpt.tutor.entity.Conversation;
import com.jlpt.tutor.model.AiUseCase;
import com.jlpt.tutor.service.ConversationService;
import com.jlpt.tutor.service.GeminiService;
import com.jlpt.tutor.service.OffTopicFilter;
import com.jlpt.tutor.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChatController.class)
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GeminiService geminiService;

    @MockBean
    private OffTopicFilter offTopicFilter;

    @MockBean
    private ConversationService conversationService;

    @MockBean
    private UserService userService;

    @Test
    void testChat_OnTopic() throws Exception {
        AiRequest request = new AiRequest();
        request.setUseCase(AiUseCase.CONVERSATION);
        request.setParams(Map.of("user_message", "tiếng nhật N4"));

        when(offTopicFilter.isOnTopic(anyString())).thenReturn(true);
        when(geminiService.chat(any(AiRequest.class)))
                .thenReturn(AiResponse.builder().message("Chào bạn!").build());
        when(conversationService.createConversation(anyString()))
                .thenReturn(Conversation.builder().id("conv-123").userId("user-001").build());

        mockMvc.perform(post("/api/ai/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-User-Id", "user-001")
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Chào bạn!"));

        verify(conversationService).saveMessage(eq("conv-123"), eq("user"), anyString());
        verify(conversationService).saveMessage(eq("conv-123"), eq("model"), eq("Chào bạn!"));
    }

    @Test
    void testChat_OffTopic() throws Exception {
        AiRequest request = new AiRequest();
        request.setUseCase(AiUseCase.CONVERSATION);
        request.setParams(Map.of("user_message", "thời tiết hôm nay thế nào?"));

        when(offTopicFilter.isOnTopic(anyString())).thenReturn(false);

        mockMvc.perform(post("/api/ai/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-User-Id", "user-001")
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Xin lỗi, tôi chỉ có thể hỗ trợ")));

        verify(geminiService, never()).chat(any());
    }

    @Test
    void testChat_WithoutUserId() throws Exception {
        AiRequest request = new AiRequest();
        request.setUseCase(AiUseCase.GRAMMAR_EXPLAIN);
        request.setParams(Map.of("user_message", "giải thích ngữ pháp N4"));
        request.setUserContext(Map.of("user_name", "Anonymous"));

        when(offTopicFilter.isOnTopic(anyString())).thenReturn(true);
        when(geminiService.chat(any(AiRequest.class)))
                .thenReturn(AiResponse.builder().message("Đây là giải thích...").build());

        mockMvc.perform(post("/api/ai/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Đây là giải thích..."));

        // No conversation persistence without userId
        verify(conversationService, never()).createConversation(any());
        verify(conversationService, never()).saveMessage(any(), any(), any());
    }

    @Test
    void testChat_AutoFillUserContext() throws Exception {
        AiRequest request = new AiRequest();
        request.setUseCase(AiUseCase.GRAMMAR_EXPLAIN);
        request.setParams(Map.of("user_message", "giải thích ngữ pháp N4"));
        // No userContext — should be auto-filled from DB

        when(offTopicFilter.isOnTopic(anyString())).thenReturn(true);
        when(userService.buildUserContext("user-001"))
                .thenReturn(Map.of("user_name", "Minh", "jlpt_level", "N4"));
        when(geminiService.chat(any(AiRequest.class)))
                .thenReturn(AiResponse.builder().message("OK").build());
        when(conversationService.createConversation("user-001"))
                .thenReturn(Conversation.builder().id("conv-456").userId("user-001").build());

        mockMvc.perform(post("/api/ai/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-User-Id", "user-001")
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(userService).buildUserContext("user-001");
    }
}
