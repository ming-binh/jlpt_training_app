package com.jlpt.tutor.service;

import com.jlpt.tutor.entity.ChatMessage;
import com.jlpt.tutor.entity.Conversation;
import com.jlpt.tutor.model.Message;
import com.jlpt.tutor.repository.ChatMessageRepository;
import com.jlpt.tutor.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Transactional
    public Conversation createConversation(String userId) {
        Conversation conversation = Conversation.builder()
                .userId(userId)
                .build();
        Conversation saved = conversationRepository.save(conversation);
        log.info("Created conversation id={} for userId={}", saved.getId(), userId);
        return saved;
    }

    @Transactional
    public void saveMessage(String conversationId, String role, String content) {
        ChatMessage message = ChatMessage.builder()
                .conversationId(conversationId)
                .role(role)
                .content(content)
                .build();
        chatMessageRepository.save(message);
    }

    public List<Message> getHistory(String conversationId) {
        return chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(cm -> new Message(cm.getRole(), cm.getContent()))
                .toList();
    }

    public Optional<Conversation> findConversation(String conversationId) {
        return conversationRepository.findById(conversationId);
    }

    public List<Conversation> getConversations(String userId) {
        return conversationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
