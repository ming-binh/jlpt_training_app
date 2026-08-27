package com.jlpt.tutor.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "jlpt_exam_answer")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JlptExamAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    @JsonIgnore
    private JlptExamAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private JlptExamQuestion question;

    private Integer selectedOption; // 1..4 (or null if skipped)

    @Builder.Default
    private Boolean isCorrect = false;
}
