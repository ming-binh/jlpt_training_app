package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.JlptExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JlptExamAttemptRepository extends JpaRepository<JlptExamAttempt, Long> {

    @Query("SELECT a FROM JlptExamAttempt a LEFT JOIN FETCH a.exam WHERE a.userId = :userId ORDER BY a.submittedAt DESC")
    List<JlptExamAttempt> findByUserIdOrderBySubmittedAtDesc(@Param("userId") String userId);

    @Query("SELECT a FROM JlptExamAttempt a LEFT JOIN FETCH a.exam WHERE a.userId = :userId AND a.exam.id = :examId ORDER BY a.submittedAt DESC")
    List<JlptExamAttempt> findByUserIdAndExamIdOrderBySubmittedAtDesc(@Param("userId") String userId, @Param("examId") Long examId);

    Optional<JlptExamAttempt> findFirstByUserIdAndExamIdAndSectionIdOrderByScoreDesc(String userId, Long examId, Long sectionId);

    Optional<JlptExamAttempt> findFirstByUserIdAndExamIdAndSectionIdIsNullOrderByScoreDesc(String userId, Long examId);
}
