package com.jlpt.tutor.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    private String id; // Use String for UUID from Supabase Auth later, or custom ID

    private String username;
    private String jlptLevel; // N5, N4, N3, N2, N1
    private Integer mockScore;
    private Integer streakDays;
}
