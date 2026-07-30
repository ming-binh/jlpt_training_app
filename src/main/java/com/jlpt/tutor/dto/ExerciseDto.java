package com.jlpt.tutor.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO đại diện cho một bài tập (exercise) gửi về frontend.
 * Dùng cho cả lesson exercises, practice quiz, và review.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseDto {

    private String id;

    /** flashcard | multiple_choice | fill_blank | matching */
    private String type;

    /** Câu hỏi (từ / kanji / câu có blank) */
    private String question;

    /** Furigana của câu hỏi nếu có */
    @JsonProperty("questionFurigana")
    private String questionFurigana;

    /** Nghĩa tiếng Việt (dùng cho flashcard back) */
    @JsonProperty("questionMeaning")
    private String questionMeaning;

    /** Danh sách lựa chọn (dùng cho multiple_choice) */
    private List<OptionDto> options;

    /** Đáp án đúng (option ID hoặc text) */
    private String correctAnswer;

    /** Giải thích đáp án */
    private String explanation;

    @JsonProperty("entityType")
    private String entityType; // VOCABULARY | KANJI | GRAMMAR

    @JsonProperty("entityId")
    private Long entityId;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionDto {
        private String id;
        private String text;
        private String furigana;
    }
}
