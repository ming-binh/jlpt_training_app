package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.UserProgress;
import com.jlpt.tutor.entity.Vocabulary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {

    Page<Vocabulary> findByJlptLevelIgnoreCase(String jlptLevel, Pageable pageable);

    @Query("SELECT v FROM Vocabulary v WHERE " +
           "((:level IS NOT NULL AND :level <> '' AND UPPER(v.jlptLevel) = UPPER(:level)) OR " +
           " ((:level IS NULL OR :level = '') AND UPPER(v.jlptLevel) IN :activeLevels)) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(v.word) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.reading) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(v.meaning) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "((:isNew = false AND :status IS NULL) OR " +
           " (:isNew = true AND (:userId IS NULL OR NOT EXISTS (SELECT 1 FROM UserProgress up WHERE up.userId = :userId AND up.entityType = :entityType AND up.entityId = v.id AND up.status <> :newStatus))) OR " +
           " (:status IS NOT NULL AND :userId IS NOT NULL AND EXISTS (SELECT 1 FROM UserProgress up WHERE up.userId = :userId AND up.entityType = :entityType AND up.entityId = v.id AND up.status = :status)))")
    Page<Vocabulary> searchVocabulary(@Param("level") String level,
                                      @Param("activeLevels") List<String> activeLevels,
                                      @Param("search") String search,
                                      @Param("entityType") UserProgress.EntityType entityType,
                                      @Param("status") UserProgress.ProgressStatus status,
                                      @Param("newStatus") UserProgress.ProgressStatus newStatus,
                                      @Param("isNew") boolean isNew,
                                      @Param("userId") String userId,
                                      Pageable pageable);

    @Query("SELECT COUNT(v) FROM Vocabulary v WHERE UPPER(v.jlptLevel) = UPPER(:jlptLevel)")
    long countByJlptLevelIgnoreCase(@Param("jlptLevel") String jlptLevel);

    long countByJlptLevel(String jlptLevel);
    boolean existsByWordAndJlptLevel(String word, String jlptLevel);
    Optional<Vocabulary> findFirstByWord(String word);
}
