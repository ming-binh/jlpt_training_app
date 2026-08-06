package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.Vocabulary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {

    Page<Vocabulary> findByJlptLevelIgnoreCase(String jlptLevel, Pageable pageable);

    @Query("SELECT v FROM Vocabulary v WHERE " +
           "(:level IS NULL OR :level = '' OR UPPER(v.jlptLevel) = UPPER(:level)) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(v.word) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.reading) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.meaning) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR " +
           "  (:status = 'NEW' AND NOT EXISTS (SELECT 1 FROM UserProgress up WHERE up.userId = :userId AND up.entityType = 'VOCABULARY' AND up.entityId = v.id)) OR " +
           "  (:status <> 'NEW' AND EXISTS (SELECT 1 FROM UserProgress up WHERE up.userId = :userId AND up.entityType = 'VOCABULARY' AND up.entityId = v.id AND up.status = :status))" +
           ")")
    Page<Vocabulary> searchVocabulary(@Param("level") String level, @Param("search") String search,
                                       @Param("status") String status, @Param("userId") String userId,
                                       Pageable pageable);

    @Query("SELECT COUNT(v) FROM Vocabulary v WHERE UPPER(v.jlptLevel) = UPPER(:jlptLevel)")
    long countByJlptLevelIgnoreCase(@Param("jlptLevel") String jlptLevel);

    long countByJlptLevel(String jlptLevel);
    boolean existsByWordAndJlptLevel(String word, String jlptLevel);
    java.util.Optional<Vocabulary> findFirstByWord(String word);
}
