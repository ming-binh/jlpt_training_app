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
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        String filterLevel = (level != null && !level.isBlank() && !"ALL".equalsIgnoreCase(level)) ? level : null;
        String filterSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        Page<Vocabulary> result = vocabularyRepository.searchVocabulary(
                filterLevel, filterSearch, PageRequest.of(page, size));

        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of(
                "N5", vocabularyRepository.countByJlptLevelIgnoreCase("N5"),
                "N4", vocabularyRepository.countByJlptLevelIgnoreCase("N4"),
                "N3", vocabularyRepository.countByJlptLevelIgnoreCase("N3"),
                "N2", vocabularyRepository.countByJlptLevelIgnoreCase("N2"),
                "N1", vocabularyRepository.countByJlptLevelIgnoreCase("N1"),
                "total", vocabularyRepository.count()
        ));
    }
}
