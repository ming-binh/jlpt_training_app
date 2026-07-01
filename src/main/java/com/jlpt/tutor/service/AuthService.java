package com.jlpt.tutor.service;

import com.jlpt.tutor.dto.auth.AuthRequest;
import com.jlpt.tutor.dto.auth.AuthResponse;
import com.jlpt.tutor.dto.auth.RegisterRequest;
import com.jlpt.tutor.entity.Role;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.repository.UserRepository;
import com.jlpt.tutor.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email đã được sử dụng");
        }

        var user = User.builder()
                .id(UUID.randomUUID().toString())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .username(request.getUsername())
                .jlptLevel(request.getJlptLevel())
                .role(Role.USER)
                .mockScore(0)
                .streakDays(0)
                .build();
        
        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .jlptLevel(user.getJlptLevel())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email hoặc mật khẩu không đúng"));
                
        var jwtToken = jwtService.generateToken(user);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .jlptLevel(user.getJlptLevel())
                .build();
    }
}
