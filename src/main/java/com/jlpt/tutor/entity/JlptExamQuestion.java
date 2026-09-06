package com.jlpt.tutor.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "jlpt_exam_question", indexes = {
    @Index(name = "idx_question_section_id", columnList = "section_id"),
    @Index(name = "idx_question_section_order", columnList = "section_id, questionNumber, orderIndex")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JlptExamQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    @JsonIgnore
    private JlptExamSection section;

    @Column(nullable = false)
    private Integer questionNumber; // e.g. 15, 16, 17...

    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText; // e.g. "風邪をひいて、のどの（　　）が悪いです。"

    private String underlinedText; // e.g. target word if any

    @Column(nullable = false, columnDefinition = "TEXT")
    private String option1; // e.g. "気分"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String option2; // e.g. "調子"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String option3; // e.g. "事情"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String option4; // e.g. "都合"

    @Column(nullable = false)
    private Integer correctOption; // 1, 2, 3, 4

    @Column(columnDefinition = "TEXT")
    private String explanation; // Lời giải chi tiết tiếng Việt & dịch câu

    @Builder.Default
    private Integer scoreWeight = 1; // Points for this question

    @Builder.Default
    private Integer orderIndex = 0;
}
