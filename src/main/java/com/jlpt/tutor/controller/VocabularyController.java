package com.jlpt.tutor.controller;

import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.entity.Vocabulary;
import com.jlpt.tutor.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import com.jlpt.tutor.service.JlptLevelConfigService;

@RestController
@RequestMapping("/api/vocabulary")
@RequiredArgsConstructor
public class VocabularyController {

    private final VocabularyRepository vocabularyRepository;
    private final JlptLevelConfigService levelConfigService;

    @GetMapping
    public ResponseEntity<Page<Vocabulary>> getVocabulary(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        String filterLevel = (level != null && !level.isBlank() && !"ALL".equalsIgnoreCase(level)) ? level : null;
        String filterSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        String userId = authentication != null && authentication.getPrincipal() instanceof User user ? user.getId() : null;
        String filterStatus = (userId != null && status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) ? status.toUpperCase() : null;

        java.util.List<String> activeLevels = levelConfigService.getActiveLevelCodes();
        if (activeLevels == null || activeLevels.isEmpty()) {
            activeLevels = java.util.List.of("N5", "N4", "N3");
        }

        Page<Vocabulary> result = vocabularyRepository.searchVocabulary(
                filterLevel, activeLevels, filterSearch, filterStatus, userId, PageRequest.of(page, size));

        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of(
                "N5", vocabularyRepository.countByJlptLevelIgnoreCase("N5"),
                "N4", vocabularyRepository.countByJlptLevelIgnoreCase("N4"),
                "N3", vocabularyRepository.countByJlptLevelIgnoreCase("N3"),
                "total", vocabularyRepository.count()
        ));
    }
}
