package com.jlpt.tutor.dto.admin;

import com.jlpt.tutor.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionMatrixResponse {
    private List<PermissionRowDto> rows;
    private Map<Role, Long> userCounts;
}
