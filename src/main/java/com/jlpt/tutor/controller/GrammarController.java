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

@RestController
@RequestMapping("/api/grammar")
@RequiredArgsConstructor
public class GrammarController {

    private final GrammarPointRepository grammarPointRepository;

    @GetMapping
    public ResponseEntity<Page<GrammarPoint>> getGrammar(
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

        Page<GrammarPoint> result = grammarPointRepository.searchGrammar(
                filterLevel, filterSearch, filterStatus, userId, PageRequest.of(page, size));

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
                "total", grammarPointRepository.count()
        ));
    }
}
