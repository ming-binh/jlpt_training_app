package com.jlpt.tutor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "interaction_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InteractionLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id")
    private String userId;

    private String useCase;
    private Integer inputTokens;
    private Integer outputTokens;
    private Long latencyMs;
    private Boolean parsedSuccessfully;
    private Float userRating;
    private String jlptLevel;
    
    private LocalDateTime timestamp;
    
    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
