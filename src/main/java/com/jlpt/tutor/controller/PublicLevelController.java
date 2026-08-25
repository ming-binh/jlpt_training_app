package com.jlpt.tutor.controller;

import com.jlpt.tutor.dto.JlptLevelConfigDto;
import com.jlpt.tutor.service.JlptLevelConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/levels")
@RequiredArgsConstructor
public class PublicLevelController {

    private final JlptLevelConfigService levelConfigService;

    @GetMapping("/config")
    public ResponseEntity<List<JlptLevelConfigDto>> getLevelConfigs() {
        return ResponseEntity.ok(levelConfigService.getPublicConfigs());
    }

    @GetMapping("/active")
    public ResponseEntity<List<String>> getActiveLevels() {
        return ResponseEntity.ok(levelConfigService.getActiveLevelCodes());
    }
}
