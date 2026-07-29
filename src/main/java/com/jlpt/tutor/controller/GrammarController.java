package com.jlpt.tutor.controller;

import com.jlpt.tutor.entity.GrammarPoint;
import com.jlpt.tutor.repository.GrammarPointRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/grammar")
@RequiredArgsConstructor
public class GrammarController {

    private final GrammarPointRepository grammarPointRepository;

    @GetMapping
    public ResponseEntity<Page<GrammarPoint>> getGrammar(
            @RequestParam(defaultValue = "N5") String level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<GrammarPoint> result = grammarPointRepository.findByJlptLevel(
                level.toUpperCase(), PageRequest.of(page, size));
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
                "N5", grammarPointRepository.countByJlptLevel("N5"),
                "N4", grammarPointRepository.countByJlptLevel("N4"),
                "total", grammarPointRepository.count()
        ));
    }
}
