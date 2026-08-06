package com.jlpt.tutor.controller;

import com.jlpt.tutor.dto.admin.AdminUserDto;
import com.jlpt.tutor.dto.admin.UpdateRoleRequest;
import com.jlpt.tutor.entity.Role;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserDto>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {

        Role roleFilter = (role != null && !role.isBlank() && !"ALL".equalsIgnoreCase(role))
                ? Role.valueOf(role.toUpperCase())
                : null;

        return ResponseEntity.ok(adminUserService.listUsers(search, roleFilter));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<AdminUserDto> updateRole(
            @PathVariable String id,
            @RequestBody UpdateRoleRequest request,
            Authentication authentication) {

        User actor = (User) authentication.getPrincipal();
        return ResponseEntity.ok(adminUserService.updateRole(id, request.getRole(), actor));
    }

    @PatchMapping("/{id}/lock")
    public ResponseEntity<AdminUserDto> toggleLock(
            @PathVariable String id,
            Authentication authentication) {

        User actor = (User) authentication.getPrincipal();
        return ResponseEntity.ok(adminUserService.toggleLock(id, actor));
    }
}
