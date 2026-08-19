package com.jlpt.tutor.service;

import com.jlpt.tutor.entity.ChatMessage;
import com.jlpt.tutor.entity.Conversation;
import com.jlpt.tutor.model.Message;
import com.jlpt.tutor.repository.ChatMessageRepository;
import com.jlpt.tutor.repository.ConversationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConversationServiceTest {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @InjectMocks
    private ConversationService conversationService;

    @Test
    void testCreateConversation() {
        Conversation saved = Conversation.builder()
                .id("conv-123")
                .userId("user-001")
                .createdAt(LocalDateTime.now())
                .build();
        when(conversationRepository.save(any(Conversation.class))).thenReturn(saved);

        Conversation result = conversationService.createConversation("user-001");

        assertEquals("conv-123", result.getId());
        assertEquals("user-001", result.getUserId());

        ArgumentCaptor<Conversation> captor = ArgumentCaptor.forClass(Conversation.class);
        verify(conversationRepository).save(captor.capture());
        assertEquals("user-001", captor.getValue().getUserId());
    }

    @Test
    void testSaveMessage() {
        conversationService.saveMessage("conv-123", "user", "こんにちは");

        ArgumentCaptor<ChatMessage> captor = ArgumentCaptor.forClass(ChatMessage.class);
        verify(chatMessageRepository).save(captor.capture());

        ChatMessage saved = captor.getValue();
        assertEquals("conv-123", saved.getConversationId());
        assertEquals("user", saved.getRole());
        assertEquals("こんにちは", saved.getContent());
    }

    @Test
    void testGetHistory() {
        List<ChatMessage> messages = List.of(
            ChatMessage.builder().role("user").content("質問です").build(),
            ChatMessage.builder().role("model").content("回答です").build()
        );
        when(chatMessageRepository.findByConversationIdOrderByCreatedAtAsc("conv-123"))
                .thenReturn(messages);

        List<Message> result = conversationService.getHistory("conv-123");

        assertEquals(2, result.size());
        assertEquals("user", result.get(0).getRole());
        assertEquals("質問です", result.get(0).getContent());
        assertEquals("model", result.get(1).getRole());
    }

    @Test
    void testGetHistory_EmptyConversation() {
        when(chatMessageRepository.findByConversationIdOrderByCreatedAtAsc("conv-empty"))
                .thenReturn(List.of());

        List<Message> result = conversationService.getHistory("conv-empty");

        assertTrue(result.isEmpty());
    }

    @Test
    void testFindConversation() {
        Conversation conv = Conversation.builder().id("conv-123").userId("user-001").build();
        when(conversationRepository.findById("conv-123")).thenReturn(Optional.of(conv));

        Optional<Conversation> result = conversationService.findConversation("conv-123");

        assertTrue(result.isPresent());
        assertEquals("user-001", result.get().getUserId());
    }

    @Test
    void testGetConversations() {
        List<Conversation> conversations = List.of(
            Conversation.builder().id("conv-2").userId("user-001").build(),
            Conversation.builder().id("conv-1").userId("user-001").build()
        );
        when(conversationRepository.findByUserIdOrderByUpdatedAtDescCreatedAtDesc("user-001"))
                .thenReturn(conversations);

        List<Conversation> result = conversationService.getConversations("user-001");

        assertEquals(2, result.size());
    }

    @Test
    void testDeleteConversation_Success() {
        Conversation conv = Conversation.builder().id("conv-123").userId("user-001").build();
        when(conversationRepository.findById("conv-123")).thenReturn(Optional.of(conv));

        boolean deleted = conversationService.deleteConversation("conv-123", "user-001");

        assertTrue(deleted);
        verify(chatMessageRepository).deleteByConversationId("conv-123");
        verify(conversationRepository).deleteConversationById("conv-123");
    }

    @Test
    void testUpdateTitle_Success() {
        Conversation conv = Conversation.builder().id("conv-123").userId("user-001").title("Old Title").build();
        when(conversationRepository.findById("conv-123")).thenReturn(Optional.of(conv));

        boolean updated = conversationService.updateTitle("conv-123", "New Title", "user-001");

        assertTrue(updated);
        assertEquals("New Title", conv.getTitle());
        verify(conversationRepository).save(conv);
    }
}
