package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.GrammarPoint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GrammarPointRepository extends JpaRepository<GrammarPoint, Long> {
    Page<GrammarPoint> findByJlptLevel(String jlptLevel, Pageable pageable);
    long countByJlptLevel(String jlptLevel);
}
