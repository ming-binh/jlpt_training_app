package com.jlpt.tutor.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jlpt.tutor.entity.JlptExam;
import com.jlpt.tutor.entity.JlptExamQuestion;
import com.jlpt.tutor.entity.JlptExamSection;
import com.jlpt.tutor.repository.JlptExamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExamDataInitializer {

    private final JlptExamRepository examRepository;
    private final ObjectMapper objectMapper;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initExams() {
        sanitizeExistingExamTitles();
        try {
            ClassPathResource resource = new ClassPathResource("data/jlpt_exams.json");
            if (!resource.exists()) {
                log.info("data/jlpt_exams.json not found, skipping exam seeding.");
                return;
            }

            InputStream is = resource.getInputStream();
            List<Map<String, Object>> examList = objectMapper.readValue(is, new TypeReference<>() {});

            for (Map<String, Object> examData : examList) {
                String code = (String) examData.get("code");
                if (code == null || code.isBlank()) continue;

                if (examRepository.existsByCode(code)) {
                    continue;
                }

                log.info("Seeding JLPT Exam: {} ({})", examData.get("title"), code);

                JlptExam exam = JlptExam.builder()
                        .code(code)
                        .title((String) examData.get("title"))
                        .jlptLevel((String) examData.get("jlptLevel"))
                        .year((Integer) examData.get("year"))
                        .month((Integer) examData.get("month"))
                        .totalTimeMinutes((Integer) examData.getOrDefault("totalTimeMinutes", 105))
                        .description((String) examData.get("description"))
                        .isPublished(true)
                        .sections(new ArrayList<>())
                        .build();

                @SuppressWarnings("unchecked")
                List<Map<String, Object>> sectionsData = (List<Map<String, Object>>) examData.get("sections");
                int totalExamQuestions = 0;

                if (sectionsData != null) {
                    for (Map<String, Object> sData : sectionsData) {
                        String sectionTypeStr = (String) sData.get("sectionType");
                        JlptExamSection.SectionType sectionType = JlptExamSection.SectionType.VOCABULARY;
                        try {
                            if (sectionTypeStr != null) {
                                sectionType = JlptExamSection.SectionType.valueOf(sectionTypeStr.toUpperCase());
                            }
                        } catch (Exception ignored) {}

                        JlptExamSection section = JlptExamSection.builder()
                                .exam(exam)
                                .sectionType(sectionType)
                                .mondaiNumber((Integer) sData.getOrDefault("mondaiNumber", 1))
                                .title((String) sData.get("title"))
                                .instruction((String) sData.get("instruction"))
                                .passageText((String) sData.get("passageText"))
                                .audioUrl((String) sData.get("audioUrl"))
                                .timeLimitMinutes((Integer) sData.getOrDefault("timeLimitMinutes", 15))
                                .orderIndex((Integer) sData.getOrDefault("orderIndex", 0))
                                .questions(new ArrayList<>())
                                .build();

                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> questionsData = (List<Map<String, Object>>) sData.get("questions");
                        if (questionsData != null) {
                            int qOrder = 0;
                            for (Map<String, Object> qData : questionsData) {
                                JlptExamQuestion question = JlptExamQuestion.builder()
                                        .section(section)
                                        .questionNumber((Integer) qData.getOrDefault("questionNumber", qOrder + 1))
                                        .questionText((String) qData.get("questionText"))
                                        .underlinedText((String) qData.get("underlinedText"))
                                        .option1((String) qData.get("option1"))
                                        .option2((String) qData.get("option2"))
                                        .option3((String) qData.get("option3"))
                                        .option4((String) qData.get("option4"))
                                        .correctOption((Integer) qData.getOrDefault("correctOption", 1))
                                        .explanation((String) qData.get("explanation"))
                                        .scoreWeight((Integer) qData.getOrDefault("scoreWeight", 1))
                                        .orderIndex(qOrder++)
                                        .build();

                                section.getQuestions().add(question);
                                totalExamQuestions++;
                            }
                        }

                        exam.getSections().add(section);
                    }
                }

                exam.setTotalQuestions(totalExamQuestions);
                examRepository.save(exam);
                log.info("Successfully seeded exam '{}' with {} sections and {} questions",
                        exam.getTitle(), exam.getSections().size(), totalExamQuestions);
            }
        } catch (Exception e) {
            log.error("Failed to seed JLPT exams: {}", e.getMessage(), e);
        }
    }

    private void sanitizeExistingExamTitles() {
        try {
            List<JlptExam> exams = examRepository.findAll();
            for (JlptExam exam : exams) {
                boolean changed = false;
                String title = exam.getTitle();
                if (title != null) {
                    String newTitle = title
                            .replace("De thi", "Đề thi")
                            .replace("Thang", "Tháng");
                    if (!newTitle.equals(title)) {
                        exam.setTitle(newTitle);
                        changed = true;
                    }
                }
                String desc = exam.getDescription();
                if (desc != null && desc.startsWith("De thi")) {
                    exam.setDescription("Đề thi chính thức kỳ thi Năng lực Nhật ngữ " + exam.getJlptLevel() + " đợt tháng " + exam.getMonth() + "/" + exam.getYear() + ". Cấp độ nhập môn tiếng Nhật.");
                    changed = true;
                }
                if (exam.getSections() != null) {
                    for (JlptExamSection sec : exam.getSections()) {
                        String secTitle = sec.getTitle();
                        if (secTitle != null) {
                            String newSecTitle = secTitle
                                    .replace("Doc chu Han", "Đọc chữ Hán")
                                    .replace("Viet chu Han", "Viết chữ Hán")
                                    .replace("Dien tu vao cho trong", "Điền từ vào chỗ trống")
                                    .replace("Tu dong nghia", "Từ đồng nghĩa")
                                    .replace("Cach dung tu", "Cách dùng từ")
                                    .replace("Dien ngu phap thich hop cho cau", "Điền ngữ pháp thích hợp cho câu")
                                    .replace("Sap xep thu tu tu trong cau (sao)", "Sắp xếp thứ tự trong câu (★)")
                                    .replace("Sap xep thu tu trong cau (sao)", "Sắp xếp thứ tự trong câu (★)")
                                    .replace("Ngu phap trong doan van", "Ngữ pháp trong đoạn văn")
                                    .replace("Doc hieu doan van ngan", "Đọc hiểu đoạn văn ngắn")
                                    .replace("Doc hieu doan van trung", "Đọc hiểu đoạn văn trung")
                                    .replace("Doc hieu tim kiem thong tin", "Đọc hiểu tìm kiếm thông tin");
                            if (!newSecTitle.equals(secTitle)) {
                                sec.setTitle(newSecTitle);
                                changed = true;
                            }
                        }
                    }
                }
                if (changed) {
                    examRepository.save(exam);
                    log.info("Sanitized titles for exam: {}", exam.getCode());
                }
            }
        } catch (Exception e) {
            log.warn("Could not sanitize exam titles: {}", e.getMessage());
        }
    }
}
