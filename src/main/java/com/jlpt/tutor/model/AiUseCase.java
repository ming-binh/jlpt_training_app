package com.jlpt.tutor.model;

public enum AiUseCase {
    GRAMMAR_EXPLAIN,
    WRITING_CHECK,
    QUIZ_EXPLANATION,
    CONVERSATION,
    MOCK_ANALYSIS;

    public boolean needsFewShot() {
        return this == GRAMMAR_EXPLAIN || this == WRITING_CHECK || this == QUIZ_EXPLANATION;
    }
}
