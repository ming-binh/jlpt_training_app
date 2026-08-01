package com.jlpt.tutor.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jlpt.tutor.entity.Vocabulary;
import com.jlpt.tutor.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class JlptVocabApiClient {

    private static final String BASE_URL = "https://jlpt-vocab-api.vercel.app/api/words";

    private final VocabularyRepository vocabularyRepository;
    private final ObjectMapper objectMapper;

    /**
     * Fetches vocabulary for a given JLPT level from the external API and saves to DB.
     * Skips words that already exist in DB.
     */
    public int syncVocabulary(String level) {
        log.info("Syncing vocabulary for level {} from external API...", level);

        WebClient client = WebClient.builder()
                .baseUrl(BASE_URL)
                .codecs(config -> config.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();

        try {
            String response = client.get()
                    .uri("?level=" + level.replace("N", "") + "&limit=3000")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response == null || response.isBlank()) {
                log.warn("Empty response from JLPT Vocab API for level {}", level);
                return 0;
            }

            JsonNode root = objectMapper.readTree(response);
            JsonNode wordsArray = root.has("words") ? root.get("words") : root;

            if (wordsArray == null || !wordsArray.isArray()) {
                log.warn("Invalid words array from JLPT Vocab API for level {}", level);
                return 0;
            }

            List<Vocabulary> toSave = new ArrayList<>();

            for (JsonNode node : wordsArray) {
                String word = node.has("word") ? node.get("word").asText() : "";
                if (word.isBlank() || vocabularyRepository.existsByWordAndJlptLevel(word, level)) {
                    continue;
                }

                Vocabulary vocab = Vocabulary.builder()
                        .word(word)
                        .reading(node.has("furigana") ? node.get("furigana").asText("") : "")
                        .meaning(node.has("meaning") ? node.get("meaning").asText("") : "")
                        .romaji(node.has("romaji") ? node.get("romaji").asText("") : "")
                        .jlptLevel(level)
                        .build();
                toSave.add(vocab);
            }

            if (!toSave.isEmpty()) {
                vocabularyRepository.saveAll(toSave);
            }
            log.info("Saved {} new vocabulary entries from API for level {}", toSave.size(), level);
            return toSave.size();

        } catch (Exception e) {
            log.error("Failed to sync vocabulary for level {}: {}", level, e.getMessage());
            return 0;
        }
    }
}
