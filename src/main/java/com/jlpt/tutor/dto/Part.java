package com.jlpt.tutor.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Part {
    private String text;

    public static Part text(String text) {
        return Part.builder().text(text).build();
    }
}
