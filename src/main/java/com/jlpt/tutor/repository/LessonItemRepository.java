package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.LessonItem;
import com.jlpt.tutor.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonItemRepository extends JpaRepository<LessonItem, Long> {

    List<LessonItem> findByLessonIdOrderByOrderIndex(Long lessonId);

    List<LessonItem> findByLessonIdIn(List<Long> lessonIds);

    List<LessonItem> findByLessonIdAndEntityType(Long lessonId, UserProgress.EntityType entityType);
    List<LessonItem> findByEntityType(UserProgress.EntityType entityType);
    boolean existsByEntityIdAndEntityType(Long entityId, UserProgress.EntityType entityType);
}
