package com.jlpt.tutor.controller;

import com.jlpt.tutor.dto.JlptLevelConfigDto;
import com.jlpt.tutor.dto.admin.UpdateLevelConfigRequest;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.service.JlptLevelConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/levels")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminLevelController {

    private final JlptLevelConfigService levelConfigService;

    @GetMapping
    public ResponseEntity<List<JlptLevelConfigDto>> getAllLevelConfigs() {
        return ResponseEntity.ok(levelConfigService.getAllConfigsWithStats());
    }

    @PatchMapping("/{level}")
    public ResponseEntity<JlptLevelConfigDto> updateLevel(
            @PathVariable String level,
            @RequestBody UpdateLevelConfigRequest request,
            Authentication authentication) {

        User actor = authentication != null ? (User) authentication.getPrincipal() : null;
        JlptLevelConfigDto updated = levelConfigService.updateLevel(
                level,
                request.getEnabled(),
                request.getDescription(),
                actor
        );
        return ResponseEntity.ok(updated);
    }
}
