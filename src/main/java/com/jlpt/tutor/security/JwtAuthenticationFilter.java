package com.jlpt.tutor.security;

import com.jlpt.tutor.entity.Role;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JwtAuthenticationFilter
 *
 * Handles two authentication paths:
 *
 * A. Supabase tokens (prod):
 *    - sub = Supabase UUID (e.g. "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
 *    - email extracted from "email" claim
 *    - If user doesn't exist in our DB yet → auto-create (provision) on first login
 *
 * B. Legacy backend tokens (dev):
 *    - sub = user email
 *    - Behaves exactly as before
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            if (jwtService.isSupabaseToken(jwt)) {
                handleSupabaseToken(jwt, request);
            } else {
                handleLegacyToken(jwt, request);
            }
        } catch (Exception e) {
            log.warn("JWT processing failed: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    // ── Supabase path ─────────────────────────────────────────────────────────

    private void handleSupabaseToken(String jwt, HttpServletRequest request) {
        if (!jwtService.isSupabaseTokenValid(jwt)) {
            log.debug("Supabase token expired or invalid");
            return;
        }

        // Extract claims — Supabase puts UUID in "sub", email in "email"
        String supabaseId = jwtService.extractUsername(jwt); // "sub" = UUID
        String email = jwtService.extractClaim(jwt, claims -> claims.get("email", String.class));

        if (email == null) {
            log.warn("Supabase token has no email claim for sub={}", supabaseId);
            return;
        }

        // Auto-provision: create user in our DB if not yet present
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> provisionSupabaseUser(supabaseId, email, jwt));

        setAuthentication(user, request);
    }

    private User provisionSupabaseUser(String supabaseId, String email, String jwt) {
        // Try to get display name from Supabase token (user_metadata.name or email prefix)
        String displayName = jwtService.extractClaim(jwt, claims -> {
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> meta = (java.util.Map<String, Object>)
                    claims.get("user_metadata");
            if (meta != null && meta.get("name") != null) {
                return meta.get("name").toString();
            }
            return null;
        });
        if (displayName == null) {
            displayName = email.split("@")[0]; // fallback: email prefix
        }

        User newUser = User.builder()
                .id(supabaseId)
                .email(email)
                .password("") // Supabase manages password — no local password
                .username(displayName)
                .role(Role.USER)
                .jlptLevel("N5") // default level
                .streakDays(0)
                .build();

        log.info("Auto-provisioning Supabase user: email={}, id={}", email, supabaseId);
        return userRepository.save(newUser);
    }

    // ── Legacy path (dev / H2) ────────────────────────────────────────────────

    private void handleLegacyToken(String jwt, HttpServletRequest request) {
        String userEmail = jwtService.extractUsername(jwt);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            if (jwtService.isTokenValid(jwt, userDetails)) {
                setAuthentication(userDetails, request);
            }
        }
    }

    // ── Shared ───────────────────────────────────────────────────────────────

    private void setAuthentication(UserDetails userDetails, HttpServletRequest request) {
        if (SecurityContextHolder.getContext().getAuthentication() != null) return;

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }
}
