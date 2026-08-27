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
@Table(name = "jlpt_exam")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JlptExam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // e.g. "N3_2013_12", "N4_2012_12", "N5_2012_12"

    @Column(nullable = false)
    private String title; // e.g. "Đề thi JLPT N3 - Tháng 12/2013"

    @Column(nullable = false, length = 10)
    private String jlptLevel; // "N5", "N4", "N3", "N2", "N1"

    private Integer year; // 2013

    private Integer month; // 7 or 12

    @Builder.Default
    private Integer totalTimeMinutes = 105; // Total time for full exam in minutes

    @Builder.Default
    private Integer totalQuestions = 0;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    private Boolean isPublished = true;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<JlptExamSection> sections = new ArrayList<>();
}
