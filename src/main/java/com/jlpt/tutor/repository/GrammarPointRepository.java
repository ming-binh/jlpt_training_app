package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.GrammarPoint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GrammarPointRepository extends JpaRepository<GrammarPoint, Long> {

    Page<GrammarPoint> findByJlptLevelIgnoreCase(String jlptLevel, Pageable pageable);

    @Query("SELECT g FROM GrammarPoint g WHERE " +
           "(:level IS NULL OR :level = '' OR UPPER(g.jlptLevel) = UPPER(:level)) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(g.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(g.meaning) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(g.structure) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR " +
           "  (:status = 'NEW' AND NOT EXISTS (SELECT 1 FROM UserProgress up WHERE up.userId = :userId AND up.entityType = 'GRAMMAR' AND up.entityId = g.id)) OR " +
           "  (:status <> 'NEW' AND EXISTS (SELECT 1 FROM UserProgress up WHERE up.userId = :userId AND up.entityType = 'GRAMMAR' AND up.entityId = g.id AND up.status = :status))" +
           ")")
    Page<GrammarPoint> searchGrammar(@Param("level") String level, @Param("search") String search,
                                      @Param("status") String status, @Param("userId") String userId,
                                      Pageable pageable);

    @Query("SELECT COUNT(g) FROM GrammarPoint g WHERE UPPER(g.jlptLevel) = UPPER(:jlptLevel)")
    long countByJlptLevelIgnoreCase(@Param("jlptLevel") String jlptLevel);

    long countByJlptLevel(String jlptLevel);
}
