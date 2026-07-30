package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByJlptLevelOrderByOrderIndex(String jlptLevel);

    List<Lesson> findByJlptLevelAndContentTypeOrderByOrderIndex(
        String jlptLevel, Lesson.ContentType contentType
    );

    List<Lesson> findByContentTypeOrderByJlptLevelAscOrderIndexAsc(Lesson.ContentType contentType);
}
