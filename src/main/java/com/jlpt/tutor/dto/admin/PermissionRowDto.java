package com.jlpt.tutor.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionRowDto {
    private String key;
    private String label;
    private String category;
    private boolean user;
    private boolean admin;
}
