package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.Kanji;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KanjiRepository extends JpaRepository<Kanji, Long> {

    Page<Kanji> findByJlptLevelIgnoreCase(String jlptLevel, Pageable pageable);

    @Query("SELECT k FROM Kanji k WHERE " +
           "(:level IS NULL OR :level = '' OR UPPER(k.jlptLevel) = UPPER(:level)) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(k.character) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(k.meanings) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(k.onReadings) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(k.kunReadings) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Kanji> searchKanji(@Param("level") String level, @Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(k) FROM Kanji k WHERE UPPER(k.jlptLevel) = UPPER(:jlptLevel)")
    long countByJlptLevelIgnoreCase(@Param("jlptLevel") String jlptLevel);

    long countByJlptLevel(String jlptLevel);
    Optional<Kanji> findByCharacter(String character);
    boolean existsByCharacter(String character);
}
