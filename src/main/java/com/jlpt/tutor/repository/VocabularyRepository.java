package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.Vocabulary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {
    Page<Vocabulary> findByJlptLevel(String jlptLevel, Pageable pageable);
    long countByJlptLevel(String jlptLevel);
    boolean existsByWordAndJlptLevel(String word, String jlptLevel);
}
