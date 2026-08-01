package com.jlpt.tutor.controller;

import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {

        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            return ResponseEntity.notFound().build();
        }

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            user.setUsername(request.getUsername().trim());
        }
        if (request.getJlptLevel() != null && !request.getJlptLevel().isBlank()) {
            user.setJlptLevel(request.getJlptLevel().toUpperCase().trim());
        }

        User updated = userRepository.save(user);
        return ResponseEntity.ok(updated);
    }

    @Data
    public static class UpdateProfileRequest {
        private String username;
        private String jlptLevel;
    }
}
