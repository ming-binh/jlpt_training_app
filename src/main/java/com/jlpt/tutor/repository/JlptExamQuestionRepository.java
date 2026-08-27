package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.JlptExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JlptExamQuestionRepository extends JpaRepository<JlptExamQuestion, Long> {

    List<JlptExamQuestion> findBySectionIdOrderByQuestionNumberAscOrderIndexAsc(Long sectionId);

    List<JlptExamQuestion> findBySectionExamIdOrderBySectionOrderIndexAscQuestionNumberAsc(Long examId);
}
