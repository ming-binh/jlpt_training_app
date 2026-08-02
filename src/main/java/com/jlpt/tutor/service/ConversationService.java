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
    public Conversation createConversation(String userId, String title) {
        String cleanTitle = (title != null && !title.isBlank()) ? title : "Cuộc trò chuyện mới";
        if (cleanTitle.length() > 40) {
            cleanTitle = cleanTitle.substring(0, 40) + "...";
        }
        Conversation conversation = Conversation.builder()
                .userId(userId)
                .title(cleanTitle)
                .build();
        Conversation saved = conversationRepository.save(conversation);
        log.info("Created conversation id={} title='{}' for userId={}", saved.getId(), saved.getTitle(), userId);
        return saved;
    }

    @Transactional
    public Conversation createConversation(String userId) {
        return createConversation(userId, "Cuộc trò chuyện mới");
    }

    @Transactional
    public void updateTitleIfDefault(String conversationId, String firstMessage) {
        if (firstMessage == null || firstMessage.isBlank()) return;
        conversationRepository.findById(conversationId).ifPresent(conv -> {
            if (conv.getTitle() == null || conv.getTitle().equals("Cuộc trò chuyện mới")) {
                String cleanTitle = firstMessage.trim();
                if (cleanTitle.length() > 40) {
                    cleanTitle = cleanTitle.substring(0, 40) + "...";
                }
                conv.setTitle(cleanTitle);
                conversationRepository.save(conv);
            }
        });
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
