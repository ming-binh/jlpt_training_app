package com.jlpt.tutor.controller;

import com.jlpt.tutor.dto.admin.PermissionMatrixResponse;
import com.jlpt.tutor.dto.admin.TogglePermissionRequest;
import com.jlpt.tutor.entity.Role;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.service.RolePermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRoleController {

    private final RolePermissionService rolePermissionService;

    @GetMapping("/permissions")
    public ResponseEntity<PermissionMatrixResponse> getPermissions() {
        return ResponseEntity.ok(rolePermissionService.getMatrix());
    }

    @PatchMapping("/{role}/permissions/{permissionKey}")
    public ResponseEntity<Void> togglePermission(
            @PathVariable Role role,
            @PathVariable String permissionKey,
            @RequestBody TogglePermissionRequest request,
            Authentication authentication) {

        User actor = (User) authentication.getPrincipal();
        rolePermissionService.setPermission(role, permissionKey, Boolean.TRUE.equals(request.getEnabled()), actor);
        return ResponseEntity.noContent().build();
    }
}
