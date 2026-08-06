package com.jlpt.tutor.service;

import com.jlpt.tutor.entity.AuditLog;
import com.jlpt.tutor.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(String actorUserId, String action, String targetType, String targetId, String details) {
        auditLogRepository.save(AuditLog.builder()
                .actorUserId(actorUserId)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .details(details)
                .build());
    }
}
