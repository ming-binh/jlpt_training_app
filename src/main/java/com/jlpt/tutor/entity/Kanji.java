package com.jlpt.tutor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "kanji")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Kanji {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 4)
    private String character;

    @Column(length = 500)
    private String meanings; // comma-separated: "mountain, hill"

    @Column(length = 500)
    private String kunReadings; // comma-separated: "やま"

    @Column(length = 500)
    private String onReadings; // comma-separated: "サン, セン"

    @Column(name = "meanings_vi", length = 500)
    private String meaningsVi;

    private String jlptLevel; // N5, N4, N3, N2, N1 (null if unknown)

    private Integer grade; // school grade (1-8)

    private Integer strokeCount;

    public String getDisplayMeaning() {
        if (meaningsVi != null && !meaningsVi.isBlank()) {
            return meaningsVi;
        }
        return meanings != null ? meanings : "";
    }
}
