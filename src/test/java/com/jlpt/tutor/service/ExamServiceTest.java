package com.jlpt.tutor.service;

import com.jlpt.tutor.config.ExamDataInitializer;
import com.jlpt.tutor.dto.exam.*;
import com.jlpt.tutor.repository.JlptExamRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("prod")
public class ExamServiceTest {

    @Autowired
    private ExamService examService;

    @Autowired
    private JlptExamRepository examRepository;

    @Autowired
    private ExamDataInitializer examDataInitializer;

    @Test
    public void testExamWorkflow() {
        // 1. Trigger initializer to ensure seed data is loaded
        examDataInitializer.initExams();

        // 2. Fetch active exams
        List<ExamDto> allExams = examService.getExams("ALL", "test-user-exam");
        System.out.println("Total Exams found: " + allExams.size());
        assertTrue(allExams.size() >= 1, "Should have at least 1 seeded exam");

        ExamDto n3Exam = allExams.stream()
                .filter(e -> "N3".equalsIgnoreCase(e.getJlptLevel()))
                .findFirst()
                .orElse(null);
        assertNotNull(n3Exam, "N3 exam should exist");
        System.out.println("Testing Exam: " + n3Exam.getTitle() + " (Sections: " + n3Exam.getSections().size() + ")");

        // 3. Test fetching specific Mondai section questions
        assertTrue(n3Exam.getSections().size() > 0, "Should have sections");
        ExamSectionDto firstSection = n3Exam.getSections().get(0);
        ExamSectionDto sectionDetail = examService.getSectionQuestions(n3Exam.getId(), firstSection.getId());
        assertNotNull(sectionDetail);
        assertTrue(sectionDetail.getQuestions().size() > 0, "Section should have questions");
        System.out.println("Mondai 1 questions: " + sectionDetail.getQuestions().size());

        // Verify correctOption is hidden during exam taking
        for (ExamQuestionDto q : sectionDetail.getQuestions()) {
            assertNull(q.getCorrectOption(), "correctOption should be omitted during taking mode");
            assertNull(q.getExplanation(), "explanation should be omitted during taking mode");
        }

        // 4. Test submitting section exam answers
        Map<Long, Integer> answers = new HashMap<>();
        // Submit first question correctly, others default
        Long firstQId = sectionDetail.getQuestions().get(0).getId();
        answers.put(firstQId, 2); // Option 2 for salt (shio)

        ExamSubmitResponse submitResponse = examService.submitExam(
                n3Exam.getId(),
                ExamSubmitRequest.builder()
                        .sectionId(firstSection.getId())
                        .answers(answers)
                        .timeSpentSeconds(120)
                        .build(),
                "test-user-exam"
        );

        assertNotNull(submitResponse);
        System.out.println("Submit Score: " + submitResponse.getScore() + "/" + submitResponse.getMaxScore() + " (" + submitResponse.getPercentage() + "%)");
        assertTrue(submitResponse.getAttemptId() > 0);
        assertTrue(submitResponse.getReviewQuestions().size() > 0);

        // 5. Test Reviewing the submitted attempt
        ExamAttemptReviewDto review = examService.getAttemptReview(submitResponse.getAttemptId(), "test-user-exam");
        assertNotNull(review);
        assertEquals(submitResponse.getAttemptId(), review.getAttemptId());
        assertNotNull(review.getQuestions().get(0).getCorrectOption(), "correctOption should be present in review mode");
        assertNotNull(review.getQuestions().get(0).getExplanation(), "explanation should be present in review mode");
        System.out.println("Review explanation sample: " + review.getQuestions().get(0).getExplanation());

        // 6. Test User history
        List<ExamAttemptReviewDto> history = examService.getUserHistory("test-user-exam");
        assertTrue(history.size() >= 1, "History should record the submitted attempt");
        System.out.println("User attempts in history: " + history.size());
    }
}
