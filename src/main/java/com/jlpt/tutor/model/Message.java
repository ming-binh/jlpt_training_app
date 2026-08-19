package com.jlpt.tutor.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    private String id;
    private String role; // "user" or "model" or "system"
    private String content;
    private LocalDateTime createdAt;

    public Message(String role, String content) {
        this.role = role;
        this.content = content;
    }
}
