package com.jlpt.tutor.service;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PromptVariantService {

    private final Map<String, String> stablePrompts = new ConcurrentHashMap<>();
    private final Map<String, String> experimentalPrompts = new ConcurrentHashMap<>();

    public String selectPromptVariant(String useCase, String userId) {
        String hashKey = (userId != null && !userId.isBlank()) ? userId : "anonymous";
        int hash = Math.abs(hashKey.hashCode()) % 100;
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

    @PostConstruct
    public void initExperimentalVariants() {
        // Registering a Chain-of-Thought (CoT) variant for GRAMMAR_EXPLAIN
        // This variant asks the model to output <thinking> tags before answering
        String cotGrammarExplain = """
                [CONTEXT]
                User đang học grammar point: {{grammar_point}}
                Level target: {{jlpt_level}}
                
                [TASK]
                Giải thích ngữ pháp "{{grammar_point}}".
                TRƯỚC KHI TRẢ LỜI, BẠN BẮT BUỘC PHẢI SUY NGHĨ TRONG THẺ <thinking> ĐỂ LÊN DÀN Ý, PHÂN TÍCH NGỮ NGHĨA VÀ CHỌN VÍ DỤ PHÙ HỢP.
                
                Sau thẻ <thinking>, xuất ra câu trả lời theo cấu trúc sau:
                1. Ý nghĩa cơ bản (1-2 câu)
                2. Cấu trúc: [danh từ/động từ thể + grammar] → nghĩa
                3. Ví dụ 3 câu (từ đơn giản đến phức tạp), mỗi câu có:
                   - Câu tiếng Nhật với furigana
                   - Dịch tiếng Việt
                   - Ghi chú nếu có điểm đặc biệt
                4. Phân biệt với grammar point dễ nhầm lẫn (nếu có)
                5. Quiz kiểm tra 1 câu
                
                [USER INPUT]
                {{user_message}}
                """;
        registerExperimentalPrompt("GRAMMAR_EXPLAIN", cotGrammarExplain);
    }
}
