package com.jlpt.tutor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EntityType entityType; // VOCABULARY, KANJI, GRAMMAR

    @Column(nullable = false)
    private Long entityId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProgressStatus status = ProgressStatus.NEW;

    @Builder.Default
    private Integer reviewCount = 0;

    private LocalDateTime lastReviewDate;

    public enum EntityType {
        VOCABULARY, KANJI, GRAMMAR
    }

    public enum ProgressStatus {
        NEW, LEARNING, MASTERED
    }
}
