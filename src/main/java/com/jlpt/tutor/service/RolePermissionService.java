package com.jlpt.tutor.service;

import com.jlpt.tutor.dto.admin.PermissionMatrixResponse;
import com.jlpt.tutor.dto.admin.PermissionRowDto;
import com.jlpt.tutor.entity.Role;
import com.jlpt.tutor.entity.RolePermission;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.repository.RolePermissionRepository;
import com.jlpt.tutor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RolePermissionService {

    private final RolePermissionRepository rolePermissionRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public PermissionMatrixResponse getMatrix() {
        Map<String, Boolean> userEnabled = enabledMap(Role.USER);
        Map<String, Boolean> adminEnabled = enabledMap(Role.ADMIN);

        List<PermissionRowDto> rows = PermissionCatalog.ALL.stream()
                .map(p -> PermissionRowDto.builder()
                        .key(p.key())
                        .label(p.label())
                        .category(p.category())
                        .user(userEnabled.getOrDefault(p.key(), false))
                        .admin(adminEnabled.getOrDefault(p.key(), false))
                        .build())
                .toList();

        Map<Role, Long> userCounts = new HashMap<>();
        for (Role role : Role.values()) {
            userCounts.put(role, userRepository.findAll().stream().filter(u -> u.getRole() == role).count());
        }

        return PermissionMatrixResponse.builder().rows(rows).userCounts(userCounts).build();
    }

    public void setPermission(Role role, String permissionKey, boolean enabled, User actor) {
        if (!PermissionCatalog.isValidKey(permissionKey)) {
            throw new IllegalArgumentException("Quyền không hợp lệ: " + permissionKey);
        }

        RolePermission row = rolePermissionRepository.findByRoleAndPermissionKey(role, permissionKey)
                .orElseGet(() -> RolePermission.builder().role(role).permissionKey(permissionKey).build());
        row.setEnabled(enabled);
        rolePermissionRepository.save(row);

        auditLogService.log(actor.getId(), "PERMISSION_TOGGLE", "ROLE_PERMISSION",
                role + ":" + permissionKey, "enabled=" + enabled);
    }

    private Map<String, Boolean> enabledMap(Role role) {
        Map<String, Boolean> map = new HashMap<>();
        for (RolePermission rp : rolePermissionRepository.findByRole(role)) {
            map.put(rp.getPermissionKey(), Boolean.TRUE.equals(rp.getEnabled()));
        }
        return map;
    }
}
