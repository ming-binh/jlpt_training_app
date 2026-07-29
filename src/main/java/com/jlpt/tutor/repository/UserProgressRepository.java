package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    List<UserProgress> findByUserId(String userId);
    List<UserProgress> findByUserIdAndEntityType(String userId, UserProgress.EntityType entityType);
    Optional<UserProgress> findByUserIdAndEntityTypeAndEntityId(String userId, UserProgress.EntityType entityType, Long entityId);
}
