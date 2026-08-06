package com.jlpt.tutor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_user_id", nullable = false)
    private String actorUserId;

    @Column(nullable = false)
    private String action; // e.g. "USER_ROLE_CHANGE", "USER_LOCK_TOGGLE", "PERMISSION_TOGGLE", "CONTENT_DELETE"

    @Column(name = "target_type")
    private String targetType; // e.g. "USER", "ROLE_PERMISSION", "LESSON"

    @Column(name = "target_id")
    private String targetId;

    @Column(length = 500)
    private String details;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
