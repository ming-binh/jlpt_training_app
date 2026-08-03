package com.jlpt.tutor.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    
    @Id
    private String id;

    private String email;
    private String password;
    
    @Enumerated(EnumType.STRING)
    private Role role;

    private String username;
    private String jlptLevel; // N5, N4, N3, N2, N1
    private Integer mockScore;
    private Integer streakDays;
    private String weakSections;
    private LocalDateTime lastActiveAt;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + (role != null ? role.name() : "USER")));
    }

    @Override
    public String getPassword() {
        return ""; // Authentication handled via Supabase JWT
    }

    @Override
    public String getUsername() {
        return email; // Use email as the principal username for authentication
    }

    public String getDisplayName() {
        return username; // Returns the actual display name
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
