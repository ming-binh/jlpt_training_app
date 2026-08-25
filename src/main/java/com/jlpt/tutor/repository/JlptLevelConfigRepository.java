package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.JlptLevelConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JlptLevelConfigRepository extends JpaRepository<JlptLevelConfig, Long> {
    Optional<JlptLevelConfig> findByLevelIgnoreCase(String level);
    List<JlptLevelConfig> findAllByOrderByOrderIndexAsc();
    List<JlptLevelConfig> findByEnabledTrueOrderByOrderIndexAsc();
}
