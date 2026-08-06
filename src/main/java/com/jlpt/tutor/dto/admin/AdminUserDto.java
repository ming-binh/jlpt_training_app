package com.jlpt.tutor.dto.admin;

import com.jlpt.tutor.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDto {
    private String id;
    private String username;
    private String email;
    private Role role;
    private String jlptLevel;
    private Integer streakDays;
    private LocalDateTime lastActiveAt;
    private boolean locked;
}
