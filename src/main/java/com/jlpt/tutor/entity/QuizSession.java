package com.jlpt.tutor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_session")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    /** Null if this is a practice/review session (not tied to a specific lesson) */
    private Long lessonId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private SessionType sessionType; // LESSON, PRACTICE, REVIEW

    @Column(nullable = false)
    @Builder.Default
    private Integer score = 0; // 0-100

    @Builder.Default
    private Integer xpEarned = 0;

    @Builder.Default
    private Integer correctCount = 0;

    @Builder.Default
    private Integer totalCount = 0;

    private Long totalTimeMs;

    private LocalDateTime completedAt;

    public enum SessionType {
        LESSON, PRACTICE, REVIEW
    }
}
