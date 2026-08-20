package com.jlpt.tutor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "grammar_point")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrammarPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title; // e.g. "〜てもいいですか"

    @Column(columnDefinition = "TEXT")
    private String structure; // e.g. "Verb て-form + もいいですか"

    @Column(columnDefinition = "TEXT")
    private String meaning; // Vietnamese meaning

    @Column(nullable = false, length = 2)
    private String jlptLevel;

    @Column(columnDefinition = "TEXT")
    private String examples; // JSON string of example sentences

    @Column(columnDefinition = "TEXT")
    private String relatedGrammar; // comma-separated related grammar points
}
