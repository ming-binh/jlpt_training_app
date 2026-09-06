package com.jlpt.tutor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jlpt_exam_attempt", indexes = {
    @Index(name = "idx_attempt_user_submitted", columnList = "userId, submittedAt"),
    @Index(name = "idx_attempt_user_exam", columnList = "userId, exam_id"),
    @Index(name = "idx_attempt_exam_id", columnList = "exam_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JlptExamAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private JlptExam exam;

    /** Null if this is a full exam attempt, or set if user practiced a specific Mondai section */
    private Long sectionId;

    @Builder.Default
    private Integer score = 0;

    @Builder.Default
    private Integer maxScore = 0;

    @Builder.Default
    private Integer correctCount = 0;

    @Builder.Default
    private Integer totalQuestions = 0;

    @Builder.Default
    private Boolean isPassed = false;

    @Builder.Default
    private Integer timeSpentSeconds = 0;

    @Builder.Default
    private Integer xpEarned = 0;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AttemptStatus status = AttemptStatus.SUBMITTED;

    @Builder.Default
    private LocalDateTime submittedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<JlptExamAnswer> answers = new ArrayList<>();

    public enum AttemptStatus {
        IN_PROGRESS,
        SUBMITTED
    }
}
