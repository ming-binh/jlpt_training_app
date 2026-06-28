package com.jlpt.tutor.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class Content {
    private String role;
    private List<Part> parts;
}
