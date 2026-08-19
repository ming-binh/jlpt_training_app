package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ConversationRepository extends JpaRepository<Conversation, String> {

    List<Conversation> findByUserIdOrderByUpdatedAtDescCreatedAtDesc(String userId);

    @Query("SELECT c FROM Conversation c WHERE c.userId = :userId OR c.userId = 'guest' ORDER BY c.updatedAt DESC, c.createdAt DESC")
    List<Conversation> findByUserIdOrGuestOrderByUpdatedAtDescCreatedAtDesc(@Param("userId") String userId);

    @Modifying
    @Transactional
    @Query("UPDATE Conversation c SET c.userId = :userId WHERE c.userId = 'guest'")
    int migrateGuestConversationsToUser(@Param("userId") String userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Conversation c WHERE c.id = :id")
    void deleteConversationById(@Param("id") String id);
}
