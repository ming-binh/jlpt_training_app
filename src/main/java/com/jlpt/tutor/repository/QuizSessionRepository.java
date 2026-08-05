package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.QuizSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QuizSessionRepository extends JpaRepository<QuizSession, Long> {

    List<QuizSession> findByUserIdOrderByCompletedAtDesc(String userId);

    List<QuizSession> findByUserIdAndLessonId(String userId, Long lessonId);

    long countByUserIdAndSessionType(String userId, QuizSession.SessionType sessionType);

    List<QuizSession> findByUserIdAndCompletedAtAfter(String userId, LocalDateTime after);
}
