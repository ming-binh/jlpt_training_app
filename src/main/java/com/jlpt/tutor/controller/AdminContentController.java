package com.jlpt.tutor.controller;

import com.jlpt.tutor.dto.admin.AdminContentItemDto;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.service.AdminContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/content")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminContentController {

    private final AdminContentService adminContentService;

    @GetMapping
    public ResponseEntity<Page<AdminContentItemDto>> list(
            @RequestParam AdminContentService.ContentType type,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(adminContentService.list(type, level, search, PageRequest.of(page, size)));
    }

    @DeleteMapping("/{type}/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable AdminContentService.ContentType type,
            @PathVariable Long id,
            Authentication authentication) {

        User actor = (User) authentication.getPrincipal();
        adminContentService.delete(type, id, actor);
        return ResponseEntity.noContent().build();
    }
}
