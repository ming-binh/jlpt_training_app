package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.JlptExamAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JlptExamAnswerRepository extends JpaRepository<JlptExamAnswer, Long> {

    List<JlptExamAnswer> findByAttemptId(Long attemptId);
}
