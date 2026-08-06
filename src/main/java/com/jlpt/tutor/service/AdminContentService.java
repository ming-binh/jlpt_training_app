package com.jlpt.tutor.service;

import com.jlpt.tutor.dto.admin.AdminContentItemDto;
import com.jlpt.tutor.entity.*;
import com.jlpt.tutor.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminContentService {

    public enum ContentType { LESSON, VOCAB, KANJI, GRAMMAR }

    private final LessonRepository lessonRepository;
    private final VocabularyRepository vocabularyRepository;
    private final KanjiRepository kanjiRepository;
    private final GrammarPointRepository grammarPointRepository;
    private final AuditLogService auditLogService;

    public Page<AdminContentItemDto> list(ContentType type, String level, String search, Pageable pageable) {
        String filterLevel = (level != null && !level.isBlank() && !"ALL".equalsIgnoreCase(level)) ? level : null;
        String filterSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        return switch (type) {
            case VOCAB -> vocabularyRepository.searchVocabulary(filterLevel, filterSearch, pageable)
                    .map(v -> AdminContentItemDto.builder()
                            .id(String.valueOf(v.getId())).type("VOCAB")
                            .title(v.getWord() + (v.getReading() != null ? " (" + v.getReading() + ")" : ""))
                            .level(v.getJlptLevel())
                            .build());
            case KANJI -> kanjiRepository.searchKanji(filterLevel, filterSearch, pageable)
                    .map(k -> AdminContentItemDto.builder()
                            .id(String.valueOf(k.getId())).type("KANJI")
                            .title(k.getCharacter() + (k.getMeanings() != null ? " — " + k.getMeanings() : ""))
                            .level(k.getJlptLevel())
                            .build());
            case GRAMMAR -> grammarPointRepository.searchGrammar(filterLevel, filterSearch, pageable)
                    .map(g -> AdminContentItemDto.builder()
                            .id(String.valueOf(g.getId())).type("GRAMMAR")
                            .title(g.getTitle())
                            .level(g.getJlptLevel())
                            .build());
            case LESSON -> listLessons(filterLevel, filterSearch, pageable);
        };
    }

    private Page<AdminContentItemDto> listLessons(String filterLevel, String filterSearch, Pageable pageable) {
        List<Lesson> all = lessonRepository.findAll().stream()
                .filter(l -> filterLevel == null || filterLevel.equalsIgnoreCase(l.getJlptLevel()))
                .filter(l -> filterSearch == null || l.getTitle().toLowerCase().contains(filterSearch.toLowerCase()))
                .toList();

        int start = Math.min((int) pageable.getOffset(), all.size());
        int end = Math.min(start + pageable.getPageSize(), all.size());
        List<AdminContentItemDto> pageContent = all.subList(start, end).stream()
                .map(l -> AdminContentItemDto.builder()
                        .id(String.valueOf(l.getId())).type("LESSON")
                        .title(l.getTitle())
                        .level(l.getJlptLevel())
                        .itemCount(l.getItemCount())
                        .published(Boolean.TRUE.equals(l.getPublished()))
                        .build())
                .toList();

        return new PageImpl<>(pageContent, pageable, all.size());
    }

    public void delete(ContentType type, Long id, User actor) {
        boolean existed = switch (type) {
            case LESSON -> deleteIfExists(lessonRepository, id);
            case VOCAB -> deleteIfExists(vocabularyRepository, id);
            case KANJI -> deleteIfExists(kanjiRepository, id);
            case GRAMMAR -> deleteIfExists(grammarPointRepository, id);
        };

        if (!existed) {
            throw new IllegalArgumentException("Không tìm thấy nội dung");
        }

        auditLogService.log(actor.getId(), "CONTENT_DELETE", type.name(), String.valueOf(id), null);
    }

    private boolean deleteIfExists(org.springframework.data.jpa.repository.JpaRepository<?, Long> repo, Long id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }
}
