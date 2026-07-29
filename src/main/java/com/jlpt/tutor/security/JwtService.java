package com.jlpt.tutor.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JwtService — verifies two token types:
 *
 * 1. Legacy tokens  : issued by this backend, signed with ${jwt.secret} (Base64 hex).
 *                     Used only for the H2 "dev" profile.
 * 2. Supabase tokens: issued by Supabase Auth, signed with ${supabase.jwt.secret} (raw UTF-8).
 *                     Used in "prod" profile. The "sub" claim contains the Supabase user UUID.
 */
@Service
public class JwtService {

    @Value("${jwt.secret:}")
    private String legacySecretKey;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    // Supabase JWT secret — raw string, NOT Base64-encoded
    @Value("${supabase.jwt.secret:}")
    private String supabaseJwtSecret;

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Extracts the "sub" claim. For legacy tokens this is the user email;
     * for Supabase tokens this is the Supabase user UUID.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extractAllClaims(token));
    }

    /** Returns true if the token was issued by Supabase Auth. */
    public boolean isSupabaseToken(String token) {
        if (supabaseJwtSecret == null || supabaseJwtSecret.isBlank()) return false;
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSupabaseKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Validates a Supabase token — checks signature and expiry only.
     * The "sub" is a UUID, not an email, so we skip username equality check.
     */
    public boolean isSupabaseTokenValid(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSupabaseKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    /** Validates a legacy (backend-issued) token. */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    /** Generates a legacy token (dev profile only). */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getLegacyKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Claims extractAllClaims(String token) {
        // Try Supabase secret first (prod), fall back to legacy (dev)
        if (!supabaseJwtSecret.isBlank()) {
            try {
                return Jwts.parserBuilder()
                        .setSigningKey(getSupabaseKey())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
            } catch (Exception ignored) {
                // Not a Supabase token — try legacy
            }
        }
        return Jwts.parserBuilder()
                .setSigningKey(getLegacyKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    /** Supabase JWT secret is a raw UTF-8 string (not Base64). */
    private Key getSupabaseKey() {
        byte[] keyBytes = supabaseJwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /** Legacy secret is stored as Base64-encoded hex. */
    private Key getLegacyKey() {
        byte[] keyBytes = Decoders.BASE64.decode(legacySecretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
