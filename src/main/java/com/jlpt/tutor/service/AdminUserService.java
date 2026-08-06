package com.jlpt.tutor.service;

import com.jlpt.tutor.dto.admin.AdminUserDto;
import com.jlpt.tutor.entity.Role;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public List<AdminUserDto> listUsers(String search, Role roleFilter) {
        String q = search != null ? search.trim().toLowerCase() : "";
        return userRepository.findAll().stream()
                .filter(u -> roleFilter == null || u.getRole() == roleFilter)
                .filter(u -> q.isEmpty()
                        || (u.getUsername() != null && u.getUsername().toLowerCase().contains(q))
                        || (u.getEmail() != null && u.getEmail().toLowerCase().contains(q)))
                .sorted(Comparator.comparing(User::getLastActiveAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toDto)
                .toList();
    }

    public AdminUserDto updateRole(String userId, Role newRole, User actor) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        if (user.getRole() == Role.ADMIN && newRole != Role.ADMIN && countAdmins() <= 1) {
            throw new IllegalArgumentException("Không thể hạ quyền quản trị viên cuối cùng của hệ thống");
        }

        Role oldRole = user.getRole();
        user.setRole(newRole);
        User saved = userRepository.save(user);

        auditLogService.log(actor.getId(), "USER_ROLE_CHANGE", "USER", userId,
                oldRole + " -> " + newRole);

        return toDto(saved);
    }

    public AdminUserDto toggleLock(String userId, User actor) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));

        boolean currentlyLocked = Boolean.TRUE.equals(user.getLocked());
        if (!currentlyLocked && user.getRole() == Role.ADMIN && countAdmins() <= 1) {
            throw new IllegalArgumentException("Không thể khoá quản trị viên cuối cùng của hệ thống");
        }

        user.setLocked(!currentlyLocked);
        User saved = userRepository.save(user);

        auditLogService.log(actor.getId(), "USER_LOCK_TOGGLE", "USER", userId,
                saved.getLocked() ? "locked" : "unlocked");

        return toDto(saved);
    }

    private long countAdmins() {
        return userRepository.findAll().stream().filter(u -> u.getRole() == Role.ADMIN).count();
    }

    private AdminUserDto toDto(User u) {
        return AdminUserDto.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .role(u.getRole())
                .jlptLevel(u.getJlptLevel())
                .streakDays(u.getStreakDays())
                .lastActiveAt(u.getLastActiveAt())
                .locked(Boolean.TRUE.equals(u.getLocked()))
                .build();
    }
}
