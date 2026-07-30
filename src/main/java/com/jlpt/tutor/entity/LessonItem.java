package com.jlpt.tutor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lesson_item")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long lessonId;

    @Column(nullable = false)
    private Long entityId; // ID của Vocabulary / Kanji / GrammarPoint

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserProgress.EntityType entityType; // VOCABULARY, KANJI, GRAMMAR

    @Column(nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;
}
