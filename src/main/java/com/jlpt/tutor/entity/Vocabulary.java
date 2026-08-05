package com.jlpt.tutor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vocabulary")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String word;

    private String reading; // furigana

    @Column(nullable = false)
    private String meaning;

    private String romaji;

    @Column(nullable = false, length = 2)
    private String jlptLevel; // N5, N4, N3, N2, N1

    private String partOfSpeech;

    public String getDisplayMeaning() {
        return meaning != null ? meaning : "";
    }

    public String getDisplayReading() {
        if (reading != null && !reading.isBlank() && !"EMPTY".equalsIgnoreCase(reading.trim())) {
            return reading;
        }
        return word != null ? word : "";
    }
}
