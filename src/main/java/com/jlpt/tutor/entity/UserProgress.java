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

    // ── Spaced Repetition System (SM-2 algorithm) ────────────────────────────
    /** Next date this item should be reviewed */
    private LocalDateTime nextReviewDate;

    /**
     * Ease factor — controls how quickly review intervals grow.
     * Default 2.5. Range [1.3, 5.0].
     */
    @Builder.Default
    private Double easeFactor = 2.5;

    /**
     * Current interval in days until next review.
     * Starts at 1 day, grows by easeFactor each correct review.
     */
    @Builder.Default
    private Integer intervalDays = 1;

    /** XP earned from mastering this item */
    @Builder.Default
    private Integer xp = 0;

    public enum EntityType {
        VOCABULARY, KANJI, GRAMMAR
    }

    public enum ProgressStatus {
        NEW, LEARNING, MASTERED
    }
}
