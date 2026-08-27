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
}
