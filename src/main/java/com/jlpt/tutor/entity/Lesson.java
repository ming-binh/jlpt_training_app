package com.jlpt.tutor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lesson")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 2)
    private String jlptLevel; // N5, N4, N3, N2, N1

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ContentType contentType; // VOCABULARY, KANJI, GRAMMAR

    @Column(nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer itemCount = 0;

    @Builder.Default
    private Boolean published = false;

    public enum ContentType {
        VOCABULARY, KANJI, GRAMMAR
    }
}
