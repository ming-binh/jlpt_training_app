package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.JlptExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JlptExamQuestionRepository extends JpaRepository<JlptExamQuestion, Long> {

    List<JlptExamQuestion> findBySectionIdOrderByQuestionNumberAscOrderIndexAsc(Long sectionId);

    List<JlptExamQuestion> findBySectionExamIdOrderBySectionOrderIndexAscQuestionNumberAsc(Long examId);

    @Query("SELECT q.section.id, COUNT(q) FROM JlptExamQuestion q WHERE q.section.exam.id IN :examIds GROUP BY q.section.id")
    List<Object[]> countQuestionsBySectionForExamIds(@Param("examIds") List<Long> examIds);
}
