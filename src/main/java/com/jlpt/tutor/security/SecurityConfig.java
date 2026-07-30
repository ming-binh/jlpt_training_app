package com.jlpt.tutor.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Value("${spring.h2.console.enabled:false}")
    private boolean h2ConsoleEnabled;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> {
                auth
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/vocabulary/**").permitAll()
                    .requestMatchers("/api/kanji/**").permitAll()
                    .requestMatchers("/api/grammar/**").permitAll()
                    .requestMatchers("/api/ai/**").permitAll()
                    .requestMatchers("/api/lessons/**").permitAll()
                    .requestMatchers("/api/progress/**").permitAll()
                    .requestMatchers("/api/quiz/**").permitAll();

                // H2 console — only in dev (h2.console.enabled=true)
                if (h2ConsoleEnabled) {
                    auth.requestMatchers("/h2-console/**").permitAll();
                }

                auth.anyRequest().authenticated();
            })
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        // Allow H2 console iframe — only needed in dev
        if (h2ConsoleEnabled) {
            http.headers(headers -> headers.frameOptions(frame -> frame.disable()));
        }

        return http.build();
    }
}
