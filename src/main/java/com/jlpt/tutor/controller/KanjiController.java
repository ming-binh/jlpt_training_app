package com.jlpt.tutor.controller;

import com.jlpt.tutor.entity.Kanji;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.repository.KanjiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/kanji")
@RequiredArgsConstructor
public class KanjiController {

    private final KanjiRepository kanjiRepository;

    @GetMapping
    public ResponseEntity<Page<Kanji>> getKanji(
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

        Page<Kanji> result = kanjiRepository.searchKanji(
                filterLevel, filterSearch, filterStatus, userId, PageRequest.of(page, size));

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{character}")
    public ResponseEntity<Kanji> getKanjiByCharacter(@PathVariable String character) {
        return kanjiRepository.findByCharacter(character)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of(
                "N5", kanjiRepository.countByJlptLevelIgnoreCase("N5"),
                "N4", kanjiRepository.countByJlptLevelIgnoreCase("N4"),
                "N3", kanjiRepository.countByJlptLevelIgnoreCase("N3"),
                "total", kanjiRepository.count()
        ));
    }
}
