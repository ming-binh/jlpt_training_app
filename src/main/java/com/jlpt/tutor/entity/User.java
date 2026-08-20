package com.jlpt.tutor.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    
    @JsonIgnore
    private String password;
    
    @Enumerated(EnumType.STRING)
    private Role role;

    private String username; // Tên hiển thị của người dùng (có sẵn trong bảng users)
    private String jlptLevel; // N5, N4, N3, N2, N1
    private Integer mockScore;
    private Integer streakDays;
    private String weakSections;
    private LocalDateTime lastActiveAt;

    @Builder.Default
    private Boolean locked = false;

    @Builder.Default
    private Boolean onboarded = false;

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + (role != null ? role.name() : "USER")));
    }

    @Override
    @JsonIgnore
    public String getPassword() {
        return ""; // Authentication handled via Supabase JWT
    }

    @Override
    @JsonIgnore
    public String getUsername() {
        return email; // Use email as the principal username for Spring Security authentication
    }

    /**
     * Getter for Jackson serialization so "username" in JSON contains the actual display name
     */
    @JsonProperty("username")
    public String getActualUsername() {
        if (username != null && !username.isBlank()) {
            return username.trim();
        }
        if (email != null && email.contains("@")) {
            return email.split("@")[0];
        }
        return "Học Viên";
    }

    /**
     * Returns user's display name prioritizing username -> email prefix -> "Học Viên"
     */
    @JsonProperty("displayName")
    public String getDisplayName() {
        return getActualUsername();
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return locked == null || !locked;
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return locked == null || !locked;
    }
}
