package com.jlpt.tutor.service;

import com.jlpt.tutor.dto.admin.AdminUserDto;
import com.jlpt.tutor.dto.admin.DashboardStatsDto;
import com.jlpt.tutor.entity.Role;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.repository.InteractionLogRepository;
import com.jlpt.tutor.repository.LessonRepository;
import com.jlpt.tutor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private static final List<String> LEVELS = List.of("N5", "N4", "N3", "N2", "N1");

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final InteractionLogRepository interactionLogRepository;

    public DashboardStatsDto getStats() {
        List<User> allUsers = userRepository.findAll();

        long adminUsers = allUsers.stream().filter(u -> u.getRole() == Role.ADMIN).count();

        List<DashboardStatsDto.LevelCount> levelDistribution = LEVELS.stream()
                .map(level -> DashboardStatsDto.LevelCount.builder()
                        .level(level)
                        .count(allUsers.stream().filter(u -> level.equalsIgnoreCase(u.getJlptLevel())).count())
                        .build())
                .toList();

        List<AdminUserDto> recentUsers = allUsers.stream()
                .sorted(Comparator.comparing(User::getLastActiveAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(this::toDto)
                .collect(Collectors.toList());

        long aiChatSessionsToday = interactionLogRepository.countByTimestampAfter(
                LocalDate.now().atStartOfDay());

        return DashboardStatsDto.builder()
                .totalUsers(allUsers.size())
                .adminUsers(adminUsers)
                .totalLessons(lessonRepository.count())
                .aiChatSessionsToday(aiChatSessionsToday)
                .levelDistribution(levelDistribution)
                .recentUsers(recentUsers)
                .build();
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
