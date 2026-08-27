package com.jlpt.tutor.controller;

import com.jlpt.tutor.dto.exam.*;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    private String getUserId(Authentication authentication) {
        if (authentication == null) return null;
        if (authentication.getPrincipal() instanceof User user) {
            return user.getId();
        }
        return authentication.getName();
    }

    @GetMapping
    public ResponseEntity<List<ExamDto>> getExams(
            @RequestParam(required = false) String level,
            Authentication authentication) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(examService.getExams(level, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamDto> getExamDetail(
            @PathVariable Long id,
            Authentication authentication) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(examService.getExamDetail(id, userId));
    }

    @GetMapping("/{id}/sections/{sectionId}")
    public ResponseEntity<ExamSectionDto> getSectionQuestions(
            @PathVariable Long id,
            @PathVariable Long sectionId) {
        return ResponseEntity.ok(examService.getSectionQuestions(id, sectionId));
    }

    @GetMapping("/{id}/full")
    public ResponseEntity<ExamDto> getFullExamQuestions(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getFullExamQuestions(id));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ExamSubmitResponse> submitExam(
            @PathVariable Long id,
            @RequestBody ExamSubmitRequest request,
            Authentication authentication) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(examService.submitExam(id, request, userId));
    }

    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<ExamAttemptReviewDto> getAttemptReview(
            @PathVariable Long attemptId,
            Authentication authentication) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(examService.getAttemptReview(attemptId, userId));
    }

    @GetMapping("/my-history")
    public ResponseEntity<List<ExamAttemptReviewDto>> getUserHistory(Authentication authentication) {
        String userId = getUserId(authentication);
        return ResponseEntity.ok(examService.getUserHistory(userId));
    }
}
