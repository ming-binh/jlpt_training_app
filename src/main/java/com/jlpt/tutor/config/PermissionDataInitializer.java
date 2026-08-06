package com.jlpt.tutor.config;

import com.jlpt.tutor.entity.Role;
import com.jlpt.tutor.entity.RolePermission;
import com.jlpt.tutor.repository.RolePermissionRepository;
import com.jlpt.tutor.service.PermissionCatalog;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PermissionDataInitializer implements CommandLineRunner {

    private final RolePermissionRepository rolePermissionRepository;

    @Override
    public void run(String... args) {
        if (rolePermissionRepository.count() > 0) {
            log.info("Role permissions already initialized. Skipping seeding.");
            return;
        }

        log.info("Seeding default role_permissions matrix...");
        List<RolePermission> rows = new ArrayList<>();
        for (Role role : Role.values()) {
            var defaults = PermissionCatalog.DEFAULTS.getOrDefault(role, java.util.Set.of());
            for (PermissionCatalog.PermissionDef perm : PermissionCatalog.ALL) {
                rows.add(RolePermission.builder()
                        .role(role)
                        .permissionKey(perm.key())
                        .enabled(defaults.contains(perm.key()))
                        .build());
            }
        }
        rolePermissionRepository.saveAll(rows);
        log.info("Seeded {} role_permission rows.", rows.size());
    }
}
