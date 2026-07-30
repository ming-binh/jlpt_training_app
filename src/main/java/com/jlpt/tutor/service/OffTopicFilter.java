package com.jlpt.tutor.service;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OffTopicFilter {

    private static final List<String> ALLOWED_TOPICS = List.of(
        "tiếng nhật", "japanese", "jlpt", "kanji", "hiragana", "katakana",
        "ngữ pháp", "grammar", "từ vựng", "vocabulary", "hán tự",
        "n1", "n2", "n3", "n4", "n5", "bài tập", "ví dụ", "giải thích",
        "phân biệt", "dịch", "cách dùng", "nghĩa", "là gì", "tạo câu", "mẫu câu", "chào"
    );

    public boolean isOnTopic(String message) {
        if (message == null || message.isBlank()) {
            return false;
        }
        // If message contains any Japanese characters (Hiragana, Katakana, Kanji, Japanese punctuation) -> ON TOPIC
        if (message.matches(".*[\\u3040-\\u30ff\\u3000-\\u303f\\u4e00-\\u9faf].*")) {
            return true;
        }
        String lower = message.toLowerCase();
        return ALLOWED_TOPICS.stream().anyMatch(lower::contains);
    }
}
