package com.jlpt.tutor.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jlpt.tutor.entity.Kanji;
import com.jlpt.tutor.repository.KanjiRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class KanjiApiClient {

    private static final String BASE_URL = "https://kanjiapi.dev/v1";

    private final KanjiRepository kanjiRepository;
    private final ObjectMapper objectMapper;

    /**
     * Fetches all kanji for a JLPT level from kanjiapi.dev.
     * First gets the character list, then fetches details for each.
     */
    public int syncKanji(String level) {
        log.info("Syncing kanji for level {}...", level);

        WebClient client = WebClient.builder()
                .baseUrl(BASE_URL)
                .codecs(config -> config.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .build();

        try {
            // Step 1: Get list of kanji characters for the level (kanjiapi.dev uses 5, 4, 3, 2, 1)
            String levelNum = level.toUpperCase().replace("N", "");
            String listResponse = client.get()
                    .uri("/kanji/" + levelNum)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (listResponse == null) return 0;

            JsonNode charList = objectMapper.readTree(listResponse);
            List<Kanji> toSave = new ArrayList<>();
            int skipped = 0;

            for (JsonNode charNode : charList) {
                String character = charNode.asText();
                if (kanjiRepository.existsByCharacter(character)) {
                    skipped++;
                    continue;
                }

                // Step 2: Fetch detail for each kanji
                try {
                    String detailResponse = client.get()
                            .uri("/kanji/" + character)
                            .retrieve()
                            .bodyToMono(String.class)
                            .block();

                    if (detailResponse == null) continue;

                    JsonNode detail = objectMapper.readTree(detailResponse);

                    Kanji kanji = Kanji.builder()
                            .character(character)
                            .meanings(joinArray(detail.get("meanings")))
                            .kunReadings(joinArray(detail.get("kun_readings")))
                            .onReadings(joinArray(detail.get("on_readings")))
                            .jlptLevel(level.toUpperCase())
                            .grade(detail.has("grade") && !detail.get("grade").isNull()
                                    ? detail.get("grade").asInt() : null)
                            .strokeCount(detail.has("stroke_count")
                                    ? detail.get("stroke_count").asInt() : null)
                            .build();
                    toSave.add(kanji);

                    // Small delay to avoid hammering the free API
                    Thread.sleep(50);

                } catch (Exception e) {
                    log.warn("Failed to fetch detail for kanji '{}': {}", character, e.getMessage());
                }
            }

            if (!toSave.isEmpty()) {
                kanjiRepository.saveAll(toSave);
            }
            log.info("Saved {} new kanji for level {} (skipped {} existing)", toSave.size(), level, skipped);
            return toSave.size();

        } catch (Exception e) {
            log.error("Failed to sync kanji for level {}: {}", level, e.getMessage());
            return 0;
        }
    }

    private String joinArray(JsonNode arrayNode) {
        if (arrayNode == null || !arrayNode.isArray()) return "";
        List<String> items = new ArrayList<>();
        for (JsonNode item : arrayNode) {
            items.add(item.asText());
        }
        return String.join(", ", items);
    }
}
