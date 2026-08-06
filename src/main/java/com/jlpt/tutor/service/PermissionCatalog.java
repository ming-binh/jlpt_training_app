package com.jlpt.tutor.service;

import com.jlpt.tutor.entity.Role;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Static catalog of the app's permission keys. These are a fixed set defined by product
 * decisions (not admin-creatable), matching the matrix in the Admin Dashboard design.
 * Only the {@link Role} -> permission assignments are persisted/toggleable (see
 * {@link com.jlpt.tutor.entity.RolePermission}).
 */
public final class PermissionCatalog {

    public record PermissionDef(String key, String label, String category) {}

    public static final List<PermissionDef> ALL = List.of(
            new PermissionDef("content.study", "Học bài & làm quiz", "Học tập"),
            new PermissionDef("ai.chat", "Chat với AI Sensei", "Học tập"),
            new PermissionDef("content.n2n1", "Truy cập kho từ vựng N2/N1", "Học tập"),
            new PermissionDef("ai.chat.unlimited", "Không giới hạn phiên chat AI/ngày", "Học tập"),
            new PermissionDef("admin.access", "Xem trang quản trị (/admin)", "Quản trị"),
            new PermissionDef("admin.users", "Quản lý người dùng & vai trò", "Quản trị"),
            new PermissionDef("admin.content", "Tạo / sửa / xoá nội dung học", "Quản trị"),
            new PermissionDef("admin.audit_log", "Xem nhật ký hoạt động (audit log)", "Quản trị"),
            new PermissionDef("admin.system_config", "Cấu hình hệ thống & API key", "Quản trị")
    );

    /** Default enabled state per role, used only for first-run seeding. */
    public static final Map<Role, Set<String>> DEFAULTS = Map.of(
            Role.USER, Set.of("content.study", "ai.chat"),
            Role.PREMIUM, Set.of("content.study", "ai.chat", "content.n2n1", "ai.chat.unlimited"),
            Role.ADMIN, Set.of(
                    "content.study", "ai.chat", "content.n2n1", "ai.chat.unlimited",
                    "admin.access", "admin.users", "admin.content", "admin.audit_log", "admin.system_config"
            )
    );

    public static boolean isValidKey(String key) {
        return ALL.stream().anyMatch(p -> p.key().equals(key));
    }

    private PermissionCatalog() {}
}
