package com.jlpt.tutor.controller;

import com.jlpt.tutor.entity.GrammarPoint;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.repository.GrammarPointRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import com.jlpt.tutor.service.JlptLevelConfigService;

@RestController
@RequestMapping("/api/grammar")
@RequiredArgsConstructor
public class GrammarController {

    private final GrammarPointRepository grammarPointRepository;
    private final JlptLevelConfigService levelConfigService;

    private String getUserId(Authentication authentication) {
        if (authentication == null) return null;
        if (authentication.getPrincipal() instanceof User user) {
            return user.getId();
        }
        return authentication.getName();
    }

    @GetMapping
    public ResponseEntity<Page<GrammarPoint>> getGrammar(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        String filterLevel = (level != null && !level.isBlank() && !"ALL".equalsIgnoreCase(level)) ? level.trim().toUpperCase() : null;
        String filterSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        String userId = getUserId(authentication);

        boolean isNew = "NEW".equalsIgnoreCase(status);
        com.jlpt.tutor.entity.UserProgress.ProgressStatus statusEnum = null;
        if (!isNew && status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            try {
                statusEnum = com.jlpt.tutor.entity.UserProgress.ProgressStatus.valueOf(status.trim().toUpperCase());
            } catch (Exception ignored) {}
        }

        java.util.List<String> activeLevels = levelConfigService.getActiveLevelCodes();
        if (activeLevels == null || activeLevels.isEmpty()) {
            activeLevels = java.util.List.of("N5", "N4", "N3");
        }

        Page<GrammarPoint> result = grammarPointRepository.searchGrammar(
                filterLevel, activeLevels, filterSearch,
                com.jlpt.tutor.entity.UserProgress.EntityType.GRAMMAR,
                statusEnum,
                com.jlpt.tutor.entity.UserProgress.ProgressStatus.NEW,
                isNew,
                userId,
                PageRequest.of(page, size));

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GrammarPoint> getGrammarById(@PathVariable Long id) {
        return grammarPointRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of(
                "N5", grammarPointRepository.countByJlptLevelIgnoreCase("N5"),
                "N4", grammarPointRepository.countByJlptLevelIgnoreCase("N4"),
                "N3", grammarPointRepository.countByJlptLevelIgnoreCase("N3"),
                "N2", grammarPointRepository.countByJlptLevelIgnoreCase("N2"),
                "N1", grammarPointRepository.countByJlptLevelIgnoreCase("N1"),
                "total", grammarPointRepository.count()
        ));
    }
}
