package com.jlpt.tutor.service;

import com.jlpt.tutor.dto.exam.*;
import com.jlpt.tutor.entity.*;
import com.jlpt.tutor.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamService {

    private final JlptExamRepository examRepository;
    private final JlptExamSectionRepository sectionRepository;
    private final JlptExamQuestionRepository questionRepository;
    private final JlptExamAttemptRepository attemptRepository;
    private final JlptExamAnswerRepository answerRepository;
    private final JlptLevelConfigService levelConfigService;
    private final UserRepository userRepository;
    private final UserService userService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Transactional(readOnly = true)
    public List<ExamDto> getExams(String level, String userId) {
        List<String> activeLevels = levelConfigService.getActiveLevelCodes();
        if (activeLevels == null || activeLevels.isEmpty()) {
            activeLevels = List.of("N5", "N4", "N3");
        }

        String filterLevel = (level != null && !level.isBlank() && !"ALL".equalsIgnoreCase(level))
                ? level.trim().toUpperCase() : null;

        List<JlptExam> exams = examRepository.findActiveExams(filterLevel, activeLevels);

        Map<Long, List<JlptExamAttempt>> userAttemptsByExam = new HashMap<>();
        if (userId != null) {
            List<JlptExamAttempt> allAttempts = attemptRepository.findByUserIdOrderBySubmittedAtDesc(userId);
            for (JlptExamAttempt a : allAttempts) {
                if (a.getExam() != null) {
                    userAttemptsByExam.computeIfAbsent(a.getExam().getId(), k -> new ArrayList<>()).add(a);
                }
            }
        }

        List<Long> examIds = exams.stream().map(JlptExam::getId).collect(Collectors.toList());
        Map<Long, Integer> questionCountBySectionId = new HashMap<>();
        if (!examIds.isEmpty()) {
            List<Object[]> counts = questionRepository.countQuestionsBySectionForExamIds(examIds);
            for (Object[] row : counts) {
                if (row[0] != null && row[1] != null) {
                    questionCountBySectionId.put((Long) row[0], ((Number) row[1]).intValue());
                }
            }
        }

        return exams.stream().map(exam -> {
            List<JlptExamAttempt> attempts = userAttemptsByExam.getOrDefault(exam.getId(), Collections.emptyList());

            Integer bestScore = null;
            Integer maxScore = null;
            Boolean userPassed = null;
            String lastAttemptDate = null;

            if (!attempts.isEmpty()) {
                JlptExamAttempt best = attempts.stream()
                        .max(Comparator.comparingInt(a -> a.getScore() != null ? a.getScore() : 0))
                        .orElse(null);
                if (best != null) {
                    bestScore = best.getScore();
                    maxScore = best.getMaxScore();
                    userPassed = best.getIsPassed();
                    if (best.getSubmittedAt() != null) {
                        lastAttemptDate = best.getSubmittedAt().format(DATE_FORMATTER);
                    }
                }
            }

            List<ExamSectionDto> sectionDtos = exam.getSections().stream()
                    .map(s -> mapSectionSummary(s, attempts, questionCountBySectionId.getOrDefault(s.getId(), 0)))
                    .collect(Collectors.toList());

            int totalQuestions = exam.getSections().stream()
                    .mapToInt(s -> questionCountBySectionId.getOrDefault(s.getId(), 0))
                    .sum();

            return ExamDto.builder()
                    .id(exam.getId())
                    .code(exam.getCode())
                    .title(exam.getTitle())
                    .jlptLevel(exam.getJlptLevel())
                    .year(exam.getYear())
                    .month(exam.getMonth())
                    .totalTimeMinutes(exam.getTotalTimeMinutes())
                    .totalQuestions(totalQuestions > 0 ? totalQuestions : exam.getTotalQuestions())
                    .description(exam.getDescription())
                    .isPublished(exam.getIsPublished())
                    .userBestScore(bestScore)
                    .userMaxScore(maxScore)
                    .userPassed(userPassed)
                    .userAttemptCount(attempts.size())
                    .lastAttemptDate(lastAttemptDate)
                    .sections(sectionDtos)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExamDto getExamDetail(Long examId, String userId) {
        JlptExam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đề thi với id=" + examId));

        List<JlptExamAttempt> attempts = (userId != null)
                ? attemptRepository.findByUserIdAndExamIdOrderBySubmittedAtDesc(userId, examId)
                : Collections.emptyList();

        List<Object[]> counts = questionRepository.countQuestionsBySectionForExamIds(List.of(examId));
        Map<Long, Integer> questionCountBySectionId = new HashMap<>();
        for (Object[] row : counts) {
            if (row[0] != null && row[1] != null) {
                questionCountBySectionId.put((Long) row[0], ((Number) row[1]).intValue());
            }
        }

        List<ExamSectionDto> sectionDtos = exam.getSections().stream()
                .map(s -> mapSectionSummary(s, attempts, questionCountBySectionId.getOrDefault(s.getId(), 0)))
                .collect(Collectors.toList());

        int totalQuestions = exam.getSections().stream()
                .mapToInt(s -> questionCountBySectionId.getOrDefault(s.getId(), 0))
                .sum();

        return ExamDto.builder()
                .id(exam.getId())
                .code(exam.getCode())
                .title(exam.getTitle())
                .jlptLevel(exam.getJlptLevel())
                .year(exam.getYear())
                .month(exam.getMonth())
                .totalTimeMinutes(exam.getTotalTimeMinutes())
                .totalQuestions(totalQuestions > 0 ? totalQuestions : exam.getTotalQuestions())
                .description(exam.getDescription())
                .isPublished(exam.getIsPublished())
                .sections(sectionDtos)
                .build();
    }

    @Transactional(readOnly = true)
    public ExamSectionDto getSectionQuestions(Long examId, Long sectionId) {
        JlptExamSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phần thi với id=" + sectionId));

        List<ExamQuestionDto> questions = section.getQuestions().stream()
                .map(q -> ExamQuestionDto.builder()
                        .id(q.getId())
                        .sectionId(section.getId())
                        .questionNumber(q.getQuestionNumber())
                        .questionText(q.getQuestionText())
                        .underlinedText(q.getUnderlinedText())
                        .option1(q.getOption1())
                        .option2(q.getOption2())
                        .option3(q.getOption3())
                        .option4(q.getOption4())
                        .scoreWeight(q.getScoreWeight())
                        .orderIndex(q.getOrderIndex())
                        .build())
                .collect(Collectors.toList());

        return ExamSectionDto.builder()
                .id(section.getId())
                .examId(examId)
                .sectionType(section.getSectionType() != null ? section.getSectionType().name() : null)
                .mondaiNumber(section.getMondaiNumber())
                .title(section.getTitle())
                .instruction(section.getInstruction())
                .passageText(section.getPassageText())
                .audioUrl(section.getAudioUrl())
                .timeLimitMinutes(section.getTimeLimitMinutes())
                .orderIndex(section.getOrderIndex())
                .questionCount(questions.size())
                .questions(questions)
                .build();
    }

    @Transactional(readOnly = true)
    public ExamDto getFullExamQuestions(Long examId) {
        JlptExam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đề thi với id=" + examId));

        List<ExamSectionDto> sections = exam.getSections().stream().map(section -> {
            List<ExamQuestionDto> questions = section.getQuestions().stream()
                    .map(q -> ExamQuestionDto.builder()
                            .id(q.getId())
                            .sectionId(section.getId())
                            .questionNumber(q.getQuestionNumber())
                            .questionText(q.getQuestionText())
                            .underlinedText(q.getUnderlinedText())
                            .option1(q.getOption1())
                            .option2(q.getOption2())
                            .option3(q.getOption3())
                            .option4(q.getOption4())
                            .scoreWeight(q.getScoreWeight())
                            .orderIndex(q.getOrderIndex())
                            .build())
                    .collect(Collectors.toList());

            return ExamSectionDto.builder()
                    .id(section.getId())
                    .examId(exam.getId())
                    .sectionType(section.getSectionType() != null ? section.getSectionType().name() : null)
                    .mondaiNumber(section.getMondaiNumber())
                    .title(section.getTitle())
                    .instruction(section.getInstruction())
                    .passageText(section.getPassageText())
                    .audioUrl(section.getAudioUrl())
                    .timeLimitMinutes(section.getTimeLimitMinutes())
                    .orderIndex(section.getOrderIndex())
                    .questionCount(questions.size())
                    .questions(questions)
                    .build();
        }).collect(Collectors.toList());

        return ExamDto.builder()
                .id(exam.getId())
                .code(exam.getCode())
                .title(exam.getTitle())
                .jlptLevel(exam.getJlptLevel())
                .year(exam.getYear())
                .month(exam.getMonth())
                .totalTimeMinutes(exam.getTotalTimeMinutes())
                .totalQuestions(sections.stream().mapToInt(s -> s.getQuestions().size()).sum())
                .description(exam.getDescription())
                .sections(sections)
                .build();
    }

    @Transactional
    public ExamSubmitResponse submitExam(Long examId, ExamSubmitRequest request, String userId) {
        JlptExam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đề thi với id=" + examId));

        List<JlptExamQuestion> questionsToGrade;
        JlptExamSection singleSection = null;

        if (request.getSectionId() != null) {
            singleSection = sectionRepository.findById(request.getSectionId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phần thi"));
            questionsToGrade = singleSection.getQuestions();
        } else {
            questionsToGrade = exam.getSections().stream()
                    .flatMap(s -> s.getQuestions().stream())
                    .collect(Collectors.toList());
        }

        Map<Long, Integer> userAnswers = request.getAnswers() != null ? request.getAnswers() : Collections.emptyMap();

        int score = 0;
        int maxScore = 0;
        int correctCount = 0;
        List<ExamQuestionDto> reviewQuestions = new ArrayList<>();
        List<JlptExamAnswer> answersToSave = new ArrayList<>();

        for (JlptExamQuestion q : questionsToGrade) {
            int weight = q.getScoreWeight() != null ? q.getScoreWeight() : 1;
            maxScore += weight;

            Integer userChoice = userAnswers.get(q.getId());
            boolean isCorrect = userChoice != null && userChoice.equals(q.getCorrectOption());

            if (isCorrect) {
                score += weight;
                correctCount++;
            }

            reviewQuestions.add(ExamQuestionDto.builder()
                    .id(q.getId())
                    .sectionId(q.getSection().getId())
                    .questionNumber(q.getQuestionNumber())
                    .questionText(q.getQuestionText())
                    .underlinedText(q.getUnderlinedText())
                    .option1(q.getOption1())
                    .option2(q.getOption2())
                    .option3(q.getOption3())
                    .option4(q.getOption4())
                    .correctOption(q.getCorrectOption())
                    .explanation(q.getExplanation())
                    .userSelectedOption(userChoice)
                    .isCorrect(isCorrect)
                    .scoreWeight(weight)
                    .orderIndex(q.getOrderIndex())
                    .build());

            answersToSave.add(JlptExamAnswer.builder()
                    .question(q)
                    .selectedOption(userChoice)
                    .isCorrect(isCorrect)
                    .build());
        }

        double percentage = maxScore > 0 ? ((double) score / maxScore) * 100.0 : 0.0;
        boolean isPassed;
        if (request.getSectionId() != null) {
            // Luyện tập từng phần (Mondai riêng lẻ): chuẩn 50%
            isPassed = percentage >= 50.0;
        } else {
            // Thi toàn bộ đề thi chuẩn hóa theo ngưỡng đỗ chính thức của JEES (thang điểm 180)
            String level = exam.getJlptLevel() != null ? exam.getJlptLevel().toUpperCase() : "";
            double passingThreshold = switch (level) {
                case "N5" -> 44.4; // Điểm chuẩn đậu N5 >= 80/180 (~44.4%)
                case "N4" -> 50.0; // Điểm chuẩn đậu N4 >= 90/180 (50.0%)
                case "N3" -> 52.8; // Điểm chuẩn đậu N3 >= 95/180 (~52.8%)
                case "N2" -> 50.0; // Điểm chuẩn đậu N2 >= 90/180 (50.0%)
                case "N1" -> 55.6; // Điểm chuẩn đậu N1 >= 100/180 (~55.6%)
                default -> 50.0;
            };
            isPassed = percentage >= passingThreshold;
        }
        int xpEarned = correctCount * 5 + (isPassed ? 25 : 0);

        String effectiveUserId = userId != null ? userId : "guest_" + UUID.randomUUID();

        JlptExamAttempt attempt = JlptExamAttempt.builder()
                .userId(effectiveUserId)
                .exam(exam)
                .sectionId(request.getSectionId())
                .score(score)
                .maxScore(maxScore)
                .correctCount(correctCount)
                .totalQuestions(questionsToGrade.size())
                .isPassed(isPassed)
                .timeSpentSeconds(request.getTimeSpentSeconds() != null ? request.getTimeSpentSeconds() : 0)
                .xpEarned(xpEarned)
                .status(JlptExamAttempt.AttemptStatus.SUBMITTED)
                .submittedAt(LocalDateTime.now())
                .build();

        JlptExamAttempt savedAttempt = attemptRepository.save(attempt);

        for (JlptExamAnswer ans : answersToSave) {
            ans.setAttempt(savedAttempt);
        }
        answerRepository.saveAll(answersToSave);

        if (userId != null) {
            userRepository.findById(userId).ifPresent(userService::updateStreakAndLastActive);
        }

        return ExamSubmitResponse.builder()
                .attemptId(savedAttempt.getId())
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .jlptLevel(exam.getJlptLevel())
                .sectionId(request.getSectionId())
                .sectionTitle(singleSection != null ? singleSection.getTitle() : "Toàn bộ đề thi")
                .score(score)
                .maxScore(maxScore)
                .percentage(Math.round(percentage * 10.0) / 10.0)
                .correctCount(correctCount)
                .totalQuestions(questionsToGrade.size())
                .isPassed(isPassed)
                .timeSpentSeconds(attempt.getTimeSpentSeconds())
                .xpEarned(xpEarned)
                .submittedAt(savedAttempt.getSubmittedAt().format(DATE_FORMATTER))
                .reviewQuestions(reviewQuestions)
                .build();
    }

    @Transactional(readOnly = true)
    public ExamAttemptReviewDto getAttemptReview(Long attemptId, String userId) {
        JlptExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài làm với id=" + attemptId));

        List<JlptExamAnswer> answers = answerRepository.findByAttemptId(attemptId);
        Map<Long, JlptExamAnswer> answerMap = answers.stream()
                .filter(a -> a.getQuestion() != null)
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a, (a1, a2) -> a1));

        JlptExam exam = attempt.getExam();
        JlptExamSection section = attempt.getSectionId() != null
                ? sectionRepository.findById(attempt.getSectionId()).orElse(null)
                : null;

        List<JlptExamQuestion> questions;
        if (section != null) {
            questions = section.getQuestions();
        } else {
            questions = exam.getSections().stream()
                    .flatMap(s -> s.getQuestions().stream())
                    .collect(Collectors.toList());
        }

        List<ExamQuestionDto> questionDtos = questions.stream().map(q -> {
            JlptExamAnswer ans = answerMap.get(q.getId());
            Integer userChoice = ans != null ? ans.getSelectedOption() : null;
            Boolean isCorrect = ans != null ? ans.getIsCorrect() : false;

            return ExamQuestionDto.builder()
                    .id(q.getId())
                    .sectionId(q.getSection().getId())
                    .questionNumber(q.getQuestionNumber())
                    .questionText(q.getQuestionText())
                    .underlinedText(q.getUnderlinedText())
                    .option1(q.getOption1())
                    .option2(q.getOption2())
                    .option3(q.getOption3())
                    .option4(q.getOption4())
                    .correctOption(q.getCorrectOption())
                    .explanation(q.getExplanation())
                    .userSelectedOption(userChoice)
                    .isCorrect(isCorrect)
                    .scoreWeight(q.getScoreWeight())
                    .orderIndex(q.getOrderIndex())
                    .build();
        }).collect(Collectors.toList());

        double percentage = attempt.getMaxScore() > 0
                ? ((double) attempt.getScore() / attempt.getMaxScore()) * 100.0
                : 0.0;

        return ExamAttemptReviewDto.builder()
                .attemptId(attempt.getId())
                .examId(exam.getId())
                .examCode(exam.getCode())
                .examTitle(exam.getTitle())
                .jlptLevel(exam.getJlptLevel())
                .year(exam.getYear())
                .month(exam.getMonth())
                .sectionId(attempt.getSectionId())
                .sectionTitle(section != null ? section.getTitle() : "Toàn bộ đề thi")
                .mondaiNumber(section != null ? section.getMondaiNumber() : null)
                .score(attempt.getScore())
                .maxScore(attempt.getMaxScore())
                .percentage(Math.round(percentage * 10.0) / 10.0)
                .correctCount(attempt.getCorrectCount())
                .totalQuestions(attempt.getTotalQuestions())
                .isPassed(attempt.getIsPassed())
                .timeSpentSeconds(attempt.getTimeSpentSeconds())
                .xpEarned(attempt.getXpEarned())
                .submittedAt(attempt.getSubmittedAt() != null ? attempt.getSubmittedAt().format(DATE_FORMATTER) : "")
                .questions(questionDtos)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ExamAttemptReviewDto> getUserHistory(String userId) {
        if (userId == null) return Collections.emptyList();

        List<JlptExamAttempt> attempts = attemptRepository.findByUserIdOrderBySubmittedAtDesc(userId);
        if (attempts.isEmpty()) return Collections.emptyList();

        Set<Long> sectionIds = attempts.stream()
                .map(JlptExamAttempt::getSectionId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, JlptExamSection> sectionMap = sectionIds.isEmpty()
                ? Collections.emptyMap()
                : sectionRepository.findAllById(sectionIds).stream()
                        .collect(Collectors.toMap(JlptExamSection::getId, Function.identity()));

        return attempts.stream().map(a -> {
            JlptExam exam = a.getExam();
            JlptExamSection section = a.getSectionId() != null ? sectionMap.get(a.getSectionId()) : null;

            double pct = a.getMaxScore() > 0 ? ((double) a.getScore() / a.getMaxScore()) * 100.0 : 0.0;

            return ExamAttemptReviewDto.builder()
                    .attemptId(a.getId())
                    .examId(exam != null ? exam.getId() : null)
                    .examCode(exam != null ? exam.getCode() : null)
                    .examTitle(exam != null ? exam.getTitle() : "Đề thi JLPT")
                    .jlptLevel(exam != null ? exam.getJlptLevel() : "")
                    .year(exam != null ? exam.getYear() : null)
                    .month(exam != null ? exam.getMonth() : null)
                    .sectionId(a.getSectionId())
                    .sectionTitle(section != null ? section.getTitle() : "Toàn bộ đề thi")
                    .mondaiNumber(section != null ? section.getMondaiNumber() : null)
                    .score(a.getScore())
                    .maxScore(a.getMaxScore())
                    .percentage(Math.round(pct * 10.0) / 10.0)
                    .correctCount(a.getCorrectCount())
                    .totalQuestions(a.getTotalQuestions())
                    .isPassed(a.getIsPassed())
                    .timeSpentSeconds(a.getTimeSpentSeconds())
                    .xpEarned(a.getXpEarned())
                    .submittedAt(a.getSubmittedAt() != null ? a.getSubmittedAt().format(DATE_FORMATTER) : "")
                    .build();
        }).collect(Collectors.toList());
    }

    private ExamSectionDto mapSectionSummary(JlptExamSection s, List<JlptExamAttempt> attempts, int questionCount) {
        JlptExamAttempt sectionBest = attempts.stream()
                .filter(a -> Objects.equals(a.getSectionId(), s.getId()))
                .max(Comparator.comparingInt(a -> a.getScore() != null ? a.getScore() : 0))
                .orElse(null);

        int effectiveCount = questionCount > 0
                ? questionCount
                : (s.getQuestions() != null ? s.getQuestions().size() : 0);

        return ExamSectionDto.builder()
                .id(s.getId())
                .examId(s.getExam().getId())
                .sectionType(s.getSectionType() != null ? s.getSectionType().name() : null)
                .mondaiNumber(s.getMondaiNumber())
                .title(s.getTitle())
                .instruction(s.getInstruction())
                .passageText(s.getPassageText())
                .audioUrl(s.getAudioUrl())
                .timeLimitMinutes(s.getTimeLimitMinutes())
                .orderIndex(s.getOrderIndex())
                .questionCount(effectiveCount)
                .userBestScore(sectionBest != null ? sectionBest.getScore() : null)
                .userMaxScore(sectionBest != null ? sectionBest.getMaxScore() : null)
                .userPassed(sectionBest != null ? sectionBest.getIsPassed() : null)
                .build();
    }
}
