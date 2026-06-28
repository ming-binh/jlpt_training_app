package com.jlpt.tutor.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PromptVariantService {

    private final Map<String, String> stablePrompts = new ConcurrentHashMap<>();
    private final Map<String, String> experimentalPrompts = new ConcurrentHashMap<>();

    public String selectPromptVariant(String useCase, String userId) {
        int hash = Math.abs(userId.hashCode()) % 100;
        boolean useExperimental = hash < 20 && experimentalPrompts.containsKey(useCase);
        
        return useExperimental 
            ? experimentalPrompts.get(useCase) 
            : stablePrompts.get(useCase);
    }
    
    public void registerStablePrompt(String useCase, String prompt) {
        stablePrompts.put(useCase, prompt);
    }
    
    public void registerExperimentalPrompt(String useCase, String prompt) {
        experimentalPrompts.put(useCase, prompt);
    }
}
