package com.jlpt.tutor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiResponse {
    private String conversationId;
    private String message;
    private Quiz quiz;
    private List<String> related_grammar;
    private String difficulty_feedback;
    
    // For Writing check
    private Integer score;
    private List<ErrorDetail> errors;
    private String rewritten;
    private String rewritten_natural;
    private String praise;
    
    // For Conversation
    private String correction;
    private Boolean in_character;

    @Data
    public static class Quiz {
        private String question;
        private List<String> options;
        private Integer correct_index;
        private String explanation;
    }

    @Data
    public static class ErrorDetail {
        private String original;
        private String correction;
        private String type;
        private String explanation;
    }
    
    public static AiResponse fallback(String errorMsg) {
        AiResponse res = new AiResponse();
        res.setMessage(errorMsg);
        return res;
    }
}
