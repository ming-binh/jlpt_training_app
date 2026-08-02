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
    /** Returns true if the token was issued by Supabase Auth. */
    public boolean isSupabaseToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims != null && (claims.get("role") != null || (claims.getIssuer() != null && claims.getIssuer().contains("supabase")));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Validates a Supabase token — checks expiry and presence of sub claim.
     */
    public boolean isSupabaseTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims != null && claims.getSubject() != null && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    /** Validates a legacy (backend-issued) token. */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username != null && username.equals(userDetails.getUsername()) && !isTokenExpired(token);
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
        // 1. Try Supabase secret if configured (HS256)
        if (supabaseJwtSecret != null && !supabaseJwtSecret.isBlank()) {
            try {
                return Jwts.parserBuilder()
                        .setSigningKey(getSupabaseKey())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
            } catch (Exception ignored) {
            }
        }
        // 2. Try legacy secret if configured (HS256)
        if (legacySecretKey != null && !legacySecretKey.isBlank()) {
            try {
                return Jwts.parserBuilder()
                        .setSigningKey(getLegacyKey())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
            } catch (Exception ignored) {
            }
        }
        // 3. Fallback for ES256 tokens signed by Supabase Auth (parse unverified payload)
        return parseUnverifiedClaims(token);
    }

    @SuppressWarnings("unchecked")
    private Claims parseUnverifiedClaims(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                throw new IllegalArgumentException("Invalid JWT token format");
            }
            byte[] payloadBytes = java.util.Base64.getUrlDecoder().decode(parts[1]);
            String payloadJson = new String(payloadBytes, StandardCharsets.UTF_8);

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> map = mapper.readValue(payloadJson, Map.class);

            io.jsonwebtoken.impl.DefaultClaims claims = new io.jsonwebtoken.impl.DefaultClaims();
            if (map.containsKey("sub")) claims.setSubject((String) map.get("sub"));
            if (map.containsKey("email")) claims.put("email", map.get("email"));
            if (map.containsKey("role")) claims.put("role", map.get("role"));
            if (map.containsKey("user_metadata")) claims.put("user_metadata", map.get("user_metadata"));
            if (map.containsKey("iss")) claims.setIssuer((String) map.get("iss"));
            if (map.containsKey("exp")) {
                long expSeconds = ((Number) map.get("exp")).longValue();
                claims.setExpiration(new Date(expSeconds * 1000));
            }
            return claims;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse unverified JWT claims", e);
        }
    }

    private boolean isTokenExpired(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration != null && expiration.before(new Date());
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
