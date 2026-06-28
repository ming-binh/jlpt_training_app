package com.jlpt.tutor.service;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OffTopicFilter {

    private static final List<String> ALLOWED_TOPICS = List.of(
        "tiếng nhật", "japanese", "jlpt", "kanji", "hiragana", "katakana",
        "ngữ pháp", "grammar", "từ vựng", "vocabulary", "hán tự",
        "n1", "n2", "n3", "n4", "n5", "bài tập", "ví dụ", "giải thích"
    );

    public boolean isOnTopic(String message) {
        if (message == null || message.isBlank()) {
            return false;
        }
        String lower = message.toLowerCase();
        return ALLOWED_TOPICS.stream().anyMatch(lower::contains);
    }
}
