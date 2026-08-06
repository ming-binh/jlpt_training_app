package com.jlpt.tutor.dto.admin;

import com.jlpt.tutor.entity.Role;
import lombok.Data;

@Data
public class UpdateRoleRequest {
    private Role role;
}
