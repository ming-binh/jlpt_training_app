package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversationRepository extends JpaRepository<Conversation, String> {
    List<Conversation> findByUserIdOrderByUpdatedAtDescCreatedAtDesc(String userId);
}
