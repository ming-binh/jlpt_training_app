package com.jlpt.tutor.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalUsers;
    private long premiumUsers;
    private long adminUsers;
    private long totalLessons;
    private long aiChatSessionsToday;
    private List<LevelCount> levelDistribution;
    private List<AdminUserDto> recentUsers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LevelCount {
        private String level;
        private long count;
    }
}
