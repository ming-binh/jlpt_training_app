package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.JlptExamSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JlptExamSectionRepository extends JpaRepository<JlptExamSection, Long> {

    List<JlptExamSection> findByExamIdOrderByOrderIndexAsc(Long examId);

    List<JlptExamSection> findByExamIdAndSectionTypeOrderByOrderIndexAsc(Long examId, JlptExamSection.SectionType sectionType);
}
