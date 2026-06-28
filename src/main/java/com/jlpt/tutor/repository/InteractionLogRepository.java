package com.jlpt.tutor.repository;

import com.jlpt.tutor.entity.InteractionLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InteractionLogRepository extends JpaRepository<InteractionLog, String> {
}
