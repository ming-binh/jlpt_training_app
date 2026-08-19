package com.jlpt.tutor.controller;

import com.jlpt.tutor.service.RagIndexingService;
import com.jlpt.tutor.service.RagIndexingService.IndexingResult;
import com.jlpt.tutor.service.RagIndexingService.IndexingStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin-only endpoints for managing RAG vector indexing.
 * All routes under /api/admin/** are protected by hasRole("ADMIN") in SecurityConfig.
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/rag")
@RequiredArgsConstructor
public class RagAdminController {

    private final RagIndexingService ragIndexingService;

    /**
     * GET /api/admin/rag/status
     * Returns embedding coverage per content type.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        IndexingStatus status = ragIndexingService.getStatus();
        return ResponseEntity.ok(Map.of(
                "grammar",    Map.of("total", status.grammarTotal(), "indexed", status.grammarIndexed(), "pending", status.grammarTotal() - status.grammarIndexed()),
                "vocabulary", Map.of("total", status.vocabTotal(),   "indexed", status.vocabIndexed(),   "pending", status.vocabTotal()   - status.vocabIndexed()),
                "kanji",      Map.of("total", status.kanjiTotal(),   "indexed", status.kanjiIndexed(),   "pending", status.kanjiTotal()   - status.kanjiIndexed()),
                "overall",    Map.of("total", status.totalEntries(), "indexed", status.totalIndexed(),   "pending", status.totalPending())
        ));
    }

    /**
     * POST /api/admin/rag/index
     * Triggers full incremental indexing across all content types.
     * Only indexes entries where embedding IS NULL.
     */
    @PostMapping("/index")
    public ResponseEntity<Map<String, Object>> indexAll() {
        log.info("Admin triggered: RAG full index");
        IndexingResult result = ragIndexingService.indexAll();
        return ResponseEntity.ok(toResultMap(result));
    }

    /**
     * POST /api/admin/rag/index/grammar
     */
    @PostMapping("/index/grammar")
    public ResponseEntity<Map<String, Object>> indexGrammar() {
        log.info("Admin triggered: RAG grammar index");
        IndexingResult result = ragIndexingService.indexGrammar();
        return ResponseEntity.ok(toResultMap(result));
    }

    /**
     * POST /api/admin/rag/index/vocabulary
     */
    @PostMapping("/index/vocabulary")
    public ResponseEntity<Map<String, Object>> indexVocabulary() {
        log.info("Admin triggered: RAG vocabulary index");
        IndexingResult result = ragIndexingService.indexVocabulary();
        return ResponseEntity.ok(toResultMap(result));
    }

    /**
     * POST /api/admin/rag/index/kanji
     */
    @PostMapping("/index/kanji")
    public ResponseEntity<Map<String, Object>> indexKanji() {
        log.info("Admin triggered: RAG kanji index");
        IndexingResult result = ragIndexingService.indexKanji();
        return ResponseEntity.ok(toResultMap(result));
    }

    private Map<String, Object> toResultMap(IndexingResult result) {
        return Map.of(
                "indexed", result.indexed(),
                "skipped", result.skipped(),
                "failed",  result.failed()
        );
    }
}
