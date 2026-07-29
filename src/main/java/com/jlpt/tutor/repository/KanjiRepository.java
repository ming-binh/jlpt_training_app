package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.Kanji;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KanjiRepository extends JpaRepository<Kanji, Long> {
    Page<Kanji> findByJlptLevel(String jlptLevel, Pageable pageable);
    Optional<Kanji> findByCharacter(String character);
    boolean existsByCharacter(String character);
    long countByJlptLevel(String jlptLevel);
}
