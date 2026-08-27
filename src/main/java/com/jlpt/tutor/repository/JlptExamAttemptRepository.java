package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.JlptExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JlptExamAttemptRepository extends JpaRepository<JlptExamAttempt, Long> {

    List<JlptExamAttempt> findByUserIdOrderBySubmittedAtDesc(String userId);

    List<JlptExamAttempt> findByUserIdAndExamIdOrderBySubmittedAtDesc(String userId, Long examId);

    Optional<JlptExamAttempt> findFirstByUserIdAndExamIdAndSectionIdOrderByScoreDesc(String userId, Long examId, Long sectionId);

    Optional<JlptExamAttempt> findFirstByUserIdAndExamIdAndSectionIdIsNullOrderByScoreDesc(String userId, Long examId);
}
