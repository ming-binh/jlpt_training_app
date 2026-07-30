package com.jlpt.tutor.controller;

import com.jlpt.tutor.dto.ExerciseDto;
import com.jlpt.tutor.dto.LessonDto;
import com.jlpt.tutor.entity.Lesson;
import com.jlpt.tutor.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
@Slf4j
public class LessonController {

    private final LessonRepository lessonRepository;

    /**
     * GET /api/lessons?level=N5&type=VOCABULARY
     * Lấy danh sách bài học theo JLPT level và content type.
     */
    @GetMapping
    public ResponseEntity<List<LessonDto.LessonResponse>> getLessons(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String type,
            Authentication authentication) {

        String userId = authentication.getName();
        List<Lesson> lessons;

        if (level != null && type != null) {
            lessons = lessonRepository.findByJlptLevelAndContentTypeOrderByOrderIndex(
                level, Lesson.ContentType.valueOf(type)
            );
        } else if (level != null) {
            lessons = lessonRepository.findByJlptLevelOrderByOrderIndex(level);
        } else if (type != null) {
            lessons = lessonRepository.findByContentTypeOrderByJlptLevelAscOrderIndexAsc(
                Lesson.ContentType.valueOf(type)
            );
        } else {
            lessons = lessonRepository.findAll();
        }

        // TODO: join với UserProgress để tính completedCount và status cho mỗi lesson
        List<LessonDto.LessonResponse> response = lessons.stream()
            .map(l -> LessonDto.LessonResponse.builder()
                .id(l.getId())
                .title(l.getTitle())
                .description(l.getDescription())
                .jlptLevel(l.getJlptLevel())
                .contentType(l.getContentType().name())
                .orderIndex(l.getOrderIndex())
                .itemCount(l.getItemCount())
                .completedCount(0) // TODO: from UserProgress
                .status("available") // TODO: compute from UserProgress
                .build())
            .toList();

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/lessons/{id}
     * Lấy chi tiết một bài học.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LessonDto.LessonResponse> getLesson(
            @PathVariable Long id,
            Authentication authentication) {
        return lessonRepository.findById(id)
            .map(l -> ResponseEntity.ok(LessonDto.LessonResponse.builder()
                .id(l.getId())
                .title(l.getTitle())
                .description(l.getDescription())
                .jlptLevel(l.getJlptLevel())
                .contentType(l.getContentType().name())
                .orderIndex(l.getOrderIndex())
                .itemCount(l.getItemCount())
                .completedCount(0)
                .status("available")
                .build()))
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/lessons/{id}/exercises
     * Tạo danh sách bài tập cho một lesson.
     * TODO: Implement đầy đủ với LessonItemRepository + content repositories.
     */
    @GetMapping("/{id}/exercises")
    public ResponseEntity<List<ExerciseDto>> getExercises(
            @PathVariable Long id,
            Authentication authentication) {
        // Placeholder exercises — replace with real data from LessonItemRepository
        List<ExerciseDto> exercises = generatePlaceholderExercises(id);
        return ResponseEntity.ok(exercises);
    }

    /**
     * POST /api/lessons/{id}/complete
     * Lưu kết quả hoàn thành lesson, cộng XP, cập nhật UserProgress.
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<LessonDto.CompleteResponse> completeLesson(
            @PathVariable Long id,
            @RequestBody LessonDto.CompleteRequest request,
            Authentication authentication) {

        String userId = authentication.getName();
        int correct = (int) request.getResults().stream().filter(r -> Boolean.TRUE.equals(r.getCorrect())).count();
        int total = request.getResults().size();
        int score = total > 0 ? Math.round((float) correct / total * 100) : 0;
        int xpEarned = score / 10 * 5; // 5 XP per 10% score

        log.info("Lesson {} completed by user {} — score: {}, XP: {}", id, userId, score, xpEarned);

        // TODO: Save QuizSession, update UserProgress (SRS), update streak

        return ResponseEntity.ok(LessonDto.CompleteResponse.builder()
            .xpEarned(xpEarned)
            .correctCount(correct)
            .totalCount(total)
            .score(score)
            .streakUpdated(false) // TODO: check and update streak
            .build());
    }

    /** Generate placeholder exercises for demo until content is seeded */
    private List<ExerciseDto> generatePlaceholderExercises(Long lessonId) {
        List<ExerciseDto> list = new ArrayList<>();

        list.add(ExerciseDto.builder()
            .id(UUID.randomUUID().toString())
            .type("flashcard")
            .question("食べる")
            .questionFurigana("たべる")
            .questionMeaning("ăn, ăn uống")
            .correctAnswer("ăn")
            .explanation("Động từ nhóm 2 (る動詞). Dạng て-form: 食べて")
            .entityType("VOCABULARY")
            .entityId(1L)
            .build());

        list.add(ExerciseDto.builder()
            .id(UUID.randomUUID().toString())
            .type("multiple_choice")
            .question("飲む")
            .questionFurigana("のむ")
            .options(List.of(
                ExerciseDto.OptionDto.builder().id("a").text("ăn").build(),
                ExerciseDto.OptionDto.builder().id("b").text("uống").build(),
                ExerciseDto.OptionDto.builder().id("c").text("ngủ").build(),
                ExerciseDto.OptionDto.builder().id("d").text("đi").build()
            ))
            .correctAnswer("b")
            .explanation("飲む (のむ) nghĩa là uống. 食べる là ăn, 寝る là ngủ, 行く là đi.")
            .entityType("VOCABULARY")
            .entityId(2L)
            .build());

        list.add(ExerciseDto.builder()
            .id(UUID.randomUUID().toString())
            .type("fill_blank")
            .question("毎朝コーヒーを___。(uống cà phê mỗi sáng)")
            .correctAnswer("飲みます")
            .explanation("Dùng 飲む → 飲みます (thể lịch sự). Chủ ngữ 毎朝 chỉ thời gian.")
            .entityType("VOCABULARY")
            .entityId(2L)
            .build());

        return list;
    }
}
