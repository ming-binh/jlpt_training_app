package com.jlpt.tutor.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jlpt_exam_section", indexes = {
    @Index(name = "idx_section_exam_id", columnList = "exam_id"),
    @Index(name = "idx_section_exam_order", columnList = "exam_id, orderIndex")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JlptExamSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    @JsonIgnore
    private JlptExam exam;

    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private SectionType sectionType; // VOCABULARY, GRAMMAR, READING, LISTENING

    @Column(nullable = false)
    private Integer mondaiNumber; // 1..8

    @Column(nullable = false)
    private String title; // e.g. "Mondai 3: Điền từ vào chỗ trống"

    @Column(columnDefinition = "TEXT")
    private String instruction; // e.g. "問題3 ( ) に入れるのに最もよいものを、1・2・3・4・から一つえらびなさい。"

    @Column(columnDefinition = "TEXT")
    private String passageText; // For Mondai 8 & Reading Comprehension passages

    private String audioUrl; // For listening sections

    @Builder.Default
    private Integer timeLimitMinutes = 15; // Recommended time for this specific Mondai

    @Builder.Default
    private Integer orderIndex = 0;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("questionNumber ASC, orderIndex ASC")
    @Builder.Default
    private List<JlptExamQuestion> questions = new ArrayList<>();

    public enum SectionType {
        VOCABULARY,
        GRAMMAR,
        READING,
        LISTENING
    }
}
