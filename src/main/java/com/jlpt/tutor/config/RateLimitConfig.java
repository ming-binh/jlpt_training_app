package com.jlpt.tutor.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "ai.rate-limit")
public class RateLimitConfig {
    private int chatPerMinute = 10;
    private int writingCheckPerDay = 30;
    private int conversationPerDay = 10;
    private int explanationPerDay = 50;
}
