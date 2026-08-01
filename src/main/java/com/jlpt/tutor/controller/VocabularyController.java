package com.jlpt.tutor.controller;

import com.jlpt.tutor.entity.Vocabulary;
import com.jlpt.tutor.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vocabulary")
@RequiredArgsConstructor
public class VocabularyController {

    private final VocabularyRepository vocabularyRepository;

    @GetMapping
    public ResponseEntity<Page<Vocabulary>> getVocabulary(
            @RequestParam(required = false) String level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        Page<Vocabulary> result;
        if (level == null || level.isBlank() || "ALL".equalsIgnoreCase(level)) {
            result = vocabularyRepository.findAll(PageRequest.of(page, size));
        } else {
            result = vocabularyRepository.findByJlptLevel(
                    level.toUpperCase(), PageRequest.of(page, size));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of(
                "N5", vocabularyRepository.countByJlptLevel("N5"),
                "N4", vocabularyRepository.countByJlptLevel("N4"),
                "N3", vocabularyRepository.countByJlptLevel("N3"),
                "N2", vocabularyRepository.countByJlptLevel("N2"),
                "N1", vocabularyRepository.countByJlptLevel("N1"),
                "total", vocabularyRepository.count()
        ));
    }
}
