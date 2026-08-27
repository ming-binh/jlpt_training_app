package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.JlptExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JlptExamRepository extends JpaRepository<JlptExam, Long> {

    Optional<JlptExam> findByCode(String code);

    List<JlptExam> findByJlptLevelIgnoreCaseOrderByYearDescMonthDesc(String jlptLevel);

    @Query("SELECT e FROM JlptExam e WHERE " +
           "((:level IS NOT NULL AND :level <> '' AND UPPER(e.jlptLevel) = UPPER(:level)) OR " +
           " ((:level IS NULL OR :level = '') AND UPPER(e.jlptLevel) IN :activeLevels)) AND " +
           "e.isPublished = true " +
           "ORDER BY e.year DESC, e.month DESC, e.id DESC")
    List<JlptExam> findActiveExams(@Param("level") String level, @Param("activeLevels") List<String> activeLevels);

    boolean existsByCode(String code);
}
