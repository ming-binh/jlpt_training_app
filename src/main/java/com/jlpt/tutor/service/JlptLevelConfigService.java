package com.jlpt.tutor.service;

import com.jlpt.tutor.dto.JlptLevelConfigDto;
import com.jlpt.tutor.entity.JlptLevelConfig;
import com.jlpt.tutor.entity.User;
import com.jlpt.tutor.repository.GrammarPointRepository;
import com.jlpt.tutor.repository.JlptLevelConfigRepository;
import com.jlpt.tutor.repository.KanjiRepository;
import com.jlpt.tutor.repository.LessonRepository;
import com.jlpt.tutor.repository.VocabularyRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JlptLevelConfigService {

    private final JlptLevelConfigRepository levelConfigRepository;
    private final VocabularyRepository vocabularyRepository;
    private final KanjiRepository kanjiRepository;
    private final GrammarPointRepository grammarPointRepository;
    private final LessonRepository lessonRepository;
    private final AuditLogService auditLogService;

    private static final List<LevelDefinition> DEFAULT_LEVELS = List.of(
            new LevelDefinition("N5", "JLPT N5 (Sơ cấp 1)", "Dành cho người mới bắt đầu. Đã đầy đủ bài học, từ vựng, kanji và ngữ pháp.", true, 1),
            new LevelDefinition("N4", "JLPT N4 (Sơ cấp 2)", "Sơ cấp nâng cao. Đã đầy đủ bài học, từ vựng, kanji và ngữ pháp.", true, 2),
            new LevelDefinition("N3", "JLPT N3 (Trung cấp)", "Trung cấp JLPT. Đã đầy đủ từ vựng, kanji và ngữ pháp.", true, 3),
            new LevelDefinition("N2", "JLPT N2 (Trung - Cao cấp)", "Đang trong quá trình hoàn thiện nội dung và dịch thuật ngữ pháp. Admin có thể kích hoạt khi sẵn sàng.", false, 4),
            new LevelDefinition("N1", "JLPT N1 (Cao cấp)", "Đang trong quá trình hoàn thiện nội dung và dịch thuật ngữ pháp. Admin có thể kích hoạt khi sẵn sàng.", false, 5)
    );

    private record LevelDefinition(String level, String name, String description, boolean defaultEnabled, int orderIndex) {}

    @PostConstruct
    @Transactional
    public void initDefaultConfigs() {
        for (LevelDefinition def : DEFAULT_LEVELS) {
            levelConfigRepository.findByLevelIgnoreCase(def.level()).ifPresentOrElse(
                    existing -> {
                        // Already exists, keep existing configuration
                    },
                    () -> {
                        JlptLevelConfig config = JlptLevelConfig.builder()
                                .level(def.level().toUpperCase())
                                .name(def.name())
                                .description(def.description())
                                .enabled(def.defaultEnabled())
                                .orderIndex(def.orderIndex())
                                .updatedAt(LocalDateTime.now())
                                .updatedBy("SYSTEM")
                                .build();
                        levelConfigRepository.save(config);
                        log.info("Initialized JLPT Level Config: {} (enabled={})", def.level(), def.defaultEnabled());
                    }
            );
        }
    }

    public List<JlptLevelConfigDto> getAllConfigsWithStats() {
        List<JlptLevelConfig> configs = levelConfigRepository.findAllByOrderByOrderIndexAsc();
        return configs.stream().map(this::mapToDtoWithStats).collect(Collectors.toList());
    }

    public List<JlptLevelConfigDto> getPublicConfigs() {
        return levelConfigRepository.findAllByOrderByOrderIndexAsc().stream()
                .map(this::mapToDtoSimple)
                .collect(Collectors.toList());
    }

    public List<String> getActiveLevelCodes() {
        return levelConfigRepository.findByEnabledTrueOrderByOrderIndexAsc().stream()
                .map(JlptLevelConfig::getLevel)
                .collect(Collectors.toList());
    }

    public boolean isLevelActive(String level) {
        if (level == null || level.isBlank()) return true;
        return levelConfigRepository.findByLevelIgnoreCase(level)
                .map(JlptLevelConfig::getEnabled)
                .orElse(true);
    }

    @Transactional
    public JlptLevelConfigDto updateLevel(String level, Boolean enabled, String description, User actor) {
        JlptLevelConfig config = levelConfigRepository.findByLevelIgnoreCase(level)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cấp độ JLPT: " + level));

        boolean oldStatus = Boolean.TRUE.equals(config.getEnabled());
        if (enabled != null) {
            config.setEnabled(enabled);
        }
        if (description != null && !description.isBlank()) {
            config.setDescription(description);
        }
        config.setUpdatedBy(actor != null ? actor.getUsername() : "ADMIN");
        config.setUpdatedAt(LocalDateTime.now());

        JlptLevelConfig saved = levelConfigRepository.save(config);

        if (actor != null && enabled != null && oldStatus != enabled) {
            auditLogService.log(actor.getId(), "LEVEL_STATUS_CHANGE", "JLPT_LEVEL",
                    level.toUpperCase(), "enabled=" + enabled + " (was " + oldStatus + ")");
        }

        return mapToDtoWithStats(saved);
    }

    private JlptLevelConfigDto mapToDtoWithStats(JlptLevelConfig entity) {
        String lvl = entity.getLevel();
        long vocabCount = vocabularyRepository.countByJlptLevelIgnoreCase(lvl);
        long kanjiCount = kanjiRepository.countByJlptLevelIgnoreCase(lvl);
        long grammarCount = grammarPointRepository.countByJlptLevelIgnoreCase(lvl);
        long lessonCount = lessonRepository.countByJlptLevelIgnoreCase(lvl);

        return JlptLevelConfigDto.builder()
                .id(entity.getId())
                .level(entity.getLevel())
                .name(entity.getName())
                .description(entity.getDescription())
                .enabled(entity.getEnabled())
                .orderIndex(entity.getOrderIndex())
                .updatedAt(entity.getUpdatedAt())
                .updatedBy(entity.getUpdatedBy())
                .vocabularyCount(vocabCount)
                .kanjiCount(kanjiCount)
                .grammarCount(grammarCount)
                .lessonCount(lessonCount)
                .build();
    }

    private JlptLevelConfigDto mapToDtoSimple(JlptLevelConfig entity) {
        return JlptLevelConfigDto.builder()
                .id(entity.getId())
                .level(entity.getLevel())
                .name(entity.getName())
                .description(entity.getDescription())
                .enabled(entity.getEnabled())
                .orderIndex(entity.getOrderIndex())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
