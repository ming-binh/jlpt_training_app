package com.jlpt.tutor.service;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OffTopicFilter {

    private static final List<String> ALLOWED_TOPICS = List.of(
        "tiếng nhật", "japanese", "jlpt", "kanji", "hiragana", "katakana",
        "ngữ pháp", "grammar", "từ vựng", "vocabulary", "hán tự", "hán việt",
        "n1", "n2", "n3", "n4", "n5", "bài tập", "ví dụ", "giải thích",
        "phân biệt", "dịch", "cách dùng", "nghĩa", "tạo câu", "mẫu câu",
        "chưa hiểu", "phổ thông", "học tập", "bài học", "chữ hán"
    );

    private static final List<String> BLATANT_OFF_TOPIC = List.of(
        "thời tiết", "giá vàng", "chứng khoán", "tiếng anh", "bóng đá",
        "thể thao", "chính trị", "crypto", "bitcoin", "casino", "xổ số",
        "nấu ăn", "thời trang", "du lịch châu âu"
    );

    public boolean isOnTopic(String message) {
        if (message == null || message.isBlank()) {
            return false;
        }
        String lower = message.toLowerCase().trim();

        // 1. Blatant off-topic checks
        if (BLATANT_OFF_TOPIC.stream().anyMatch(lower::contains)) {
            return false;
        }

        // 2. Contains Japanese characters (Hiragana, Katakana, Kanji, Japanese punctuation) -> ON TOPIC
        if (message.matches(".*[\\u3040-\\u30ff\\u3000-\\u303f\\u4e00-\\u9faf].*")) {
            return true;
        }

        // 3. Contains educational/Japanese learning keywords
        if (ALLOWED_TOPICS.stream().anyMatch(lower::contains)) {
            return true;
        }

        // 4. Short interactive follow-up phrases in educational conversations
        return lower.startsWith("cho tôi") || lower.startsWith("tại sao") || lower.startsWith("thêm")
                || lower.startsWith("còn gì") || lower.startsWith("giúp") || lower.contains("bên trên")
                || lower.contains("ở trên") || lower.contains("vừa nêu") || lower.contains("đúng không");
    }
}
