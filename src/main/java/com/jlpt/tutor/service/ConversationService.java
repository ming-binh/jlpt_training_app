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

import java.time.LocalDateTime;
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
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId.trim() : "guest";
        String cleanTitle = (title != null && !title.isBlank()) ? title.trim() : "Cuộc trò chuyện mới";
        if (cleanTitle.length() > 50) {
            cleanTitle = cleanTitle.substring(0, 50) + "...";
        }
        Conversation conversation = Conversation.builder()
                .userId(effectiveUserId)
                .title(cleanTitle)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        Conversation saved = conversationRepository.save(conversation);
        log.info("Created conversation id={} title='{}' for userId={}", saved.getId(), saved.getTitle(), effectiveUserId);
        return saved;
    }

    @Transactional
    public Conversation createConversation(String userId) {
        return createConversation(userId, "Cuộc trò chuyện mới");
    }

    @Transactional
    public void updateTitleIfDefault(String conversationId, String firstMessage) {
        if (conversationId == null || firstMessage == null || firstMessage.isBlank()) return;
        conversationRepository.findById(conversationId).ifPresent(conv -> {
            if (conv.getTitle() == null || conv.getTitle().equals("Cuộc trò chuyện mới") || conv.getTitle().isBlank()) {
                String cleanTitle = firstMessage.trim();
                if (cleanTitle.length() > 50) {
                    cleanTitle = cleanTitle.substring(0, 50) + "...";
                }
                conv.setTitle(cleanTitle);
                conv.setUpdatedAt(LocalDateTime.now());
                conversationRepository.save(conv);
                log.info("Auto-updated default title for conversation id={} to '{}'", conversationId, cleanTitle);
            }
        });
    }

    @Transactional
    public void saveMessage(String conversationId, String role, String content) {
        if (conversationId == null || content == null || content.isBlank()) return;
        ChatMessage message = ChatMessage.builder()
                .conversationId(conversationId)
                .role(role)
                .content(content)
                .createdAt(LocalDateTime.now())
                .build();
        chatMessageRepository.save(message);

        // Touch conversation's updatedAt timestamp
        conversationRepository.findById(conversationId).ifPresent(conv -> {
            conv.setUpdatedAt(LocalDateTime.now());
            conversationRepository.save(conv);
        });
        log.debug("Saved message to conversation id={}, role={}", conversationId, role);
    }

    @Transactional
    public boolean updateTitle(String conversationId, String newTitle, String userId) {
        if (conversationId == null || newTitle == null || newTitle.isBlank()) return false;
        Optional<Conversation> convOpt = conversationRepository.findById(conversationId);
        if (convOpt.isPresent()) {
            Conversation conv = convOpt.get();
            // Allow renaming if it belongs to user, guest, or user is authorized
            if (userId != null && !userId.equals("guest") && conv.getUserId() != null 
                    && !conv.getUserId().equals("guest") && !conv.getUserId().equals(userId)) {
                log.warn("User {} attempted to rename conversation {} belonging to {}", userId, conversationId, conv.getUserId());
                return false;
            }
            String cleanTitle = newTitle.trim();
            if (cleanTitle.length() > 60) {
                cleanTitle = cleanTitle.substring(0, 60) + "...";
            }
            conv.setTitle(cleanTitle);
            conv.setUpdatedAt(LocalDateTime.now());
            conversationRepository.save(conv);
            log.info("Updated title for conversation id={} to '{}'", conversationId, cleanTitle);
            return true;
        }
        return false;
    }

    @Transactional
    public boolean deleteConversation(String conversationId, String userId) {
        if (conversationId == null) return false;
        Optional<Conversation> convOpt = conversationRepository.findById(conversationId);
        if (convOpt.isPresent()) {
            Conversation conv = convOpt.get();
            // Allow deletion if conv belongs to user, or is guest, or user is guest
            if (userId != null && !userId.equals("guest") && conv.getUserId() != null 
                    && !conv.getUserId().equals("guest") && !conv.getUserId().equals(userId)) {
                log.warn("User {} attempted to delete conversation {} belonging to {}", userId, conversationId, conv.getUserId());
                return false;
            }
            chatMessageRepository.deleteByConversationId(conversationId);
            conversationRepository.deleteConversationById(conversationId);
            log.info("Successfully deleted conversation id={} and all associated messages for userId={}", conversationId, userId);
            return true;
        }
        return false;
    }

    public List<Message> getHistory(String conversationId) {
        if (conversationId == null || conversationId.isBlank()) {
            return List.of();
        }
        return chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(cm -> Message.builder()
                        .id(cm.getId())
                        .role(cm.getRole())
                        .content(cm.getContent())
                        .createdAt(cm.getCreatedAt())
                        .build())
                .toList();
    }

    public Optional<Conversation> findConversation(String conversationId) {
        return conversationRepository.findById(conversationId);
    }

    @Transactional
    public List<Conversation> getConversations(String userId) {
        String effectiveUserId = (userId != null && !userId.isBlank()) ? userId.trim() : "guest";
        
        // If a real logged-in user requests conversations, migrate any orphaned guest conversations to this user
        if (!effectiveUserId.equals("guest")) {
            int migratedCount = conversationRepository.migrateGuestConversationsToUser(effectiveUserId);
            if (migratedCount > 0) {
                log.info("Migrated {} guest conversation(s) to userId={}", migratedCount, effectiveUserId);
            }
            return conversationRepository.findByUserIdOrderByUpdatedAtDescCreatedAtDesc(effectiveUserId);
        }
        
        return conversationRepository.findByUserIdOrderByUpdatedAtDescCreatedAtDesc("guest");
    }
}
