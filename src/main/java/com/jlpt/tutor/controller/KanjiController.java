package com.jlpt.tutor.controller;

import com.jlpt.tutor.entity.Kanji;
import com.jlpt.tutor.repository.KanjiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/kanji")
@RequiredArgsConstructor
public class KanjiController {

    private final KanjiRepository kanjiRepository;

    @GetMapping
    public ResponseEntity<Page<Kanji>> getKanji(
            @RequestParam(defaultValue = "N5") String level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<Kanji> result = kanjiRepository.findByJlptLevel(
                level.toUpperCase(), PageRequest.of(page, size));
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
                "N5", kanjiRepository.countByJlptLevel("N5"),
                "N4", kanjiRepository.countByJlptLevel("N4"),
                "N3", kanjiRepository.countByJlptLevel("N3"),
                "total", kanjiRepository.count()
        ));
    }
}
