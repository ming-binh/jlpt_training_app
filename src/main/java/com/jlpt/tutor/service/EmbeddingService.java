package com.jlpt.tutor.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Generates text embeddings via Jina AI API (jina-embeddings-v3).
 *
 * Supports batch embedding (up to 500 texts per request) with 768 output dimensions.
 * Uses task 'retrieval.passage' for documents and 'retrieval.query' for search queries.
 */
@Slf4j
@Service
public class EmbeddingService {

    private static final String JINA_API_URL = "https://api.jina.ai/v1/embeddings";
    private static final Duration TIMEOUT = Duration.ofSeconds(45);

    private final String apiKey;
    private final String model;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // In-memory cache: text -> embedding vector
    private final ConcurrentHashMap<String, float[]> cache = new ConcurrentHashMap<>();

    public EmbeddingService(
            @Value("${JINA_API_KEY:${GEMINI_API_KEY}}") String apiKey,
            @Value("${rag.embedding-model:jina-embeddings-v3}") String model) {
        this.apiKey = apiKey.strip();
        this.model = model.strip();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(TIMEOUT)
                .build();
        log.info("EmbeddingService initialized with model: {}", this.model);
    }

    /**
     * Returns a 768-dim embedding vector for a single query text (task=retrieval.query).
     */
    public float[] embed(String text) {
        if (text == null || text.isBlank()) return null;
        List<float[]> results = embedBatch(List.of(text.strip()), "retrieval.query");
        return (results != null && !results.isEmpty()) ? results.get(0) : null;
    }

    /**
     * Returns 768-dim embedding vectors for a batch of passage texts (task=retrieval.passage).
     */
    public List<float[]> embedBatch(List<String> texts) {
        return embedBatch(texts, "retrieval.passage");
    }

    public List<float[]> embedBatch(List<String> texts, String task) {
        if (texts == null || texts.isEmpty()) return Collections.emptyList();

        List<String> stripped = texts.stream().map(String::strip).toList();
        List<float[]> result = new ArrayList<>(Collections.nCopies(stripped.size(), null));

        List<Integer> uncachedIndices = new ArrayList<>();
        for (int i = 0; i < stripped.size(); i++) {
            float[] cached = cache.get(stripped.get(i));
            if (cached != null) {
                result.set(i, cached);
            } else {
                uncachedIndices.add(i);
            }
        }

        if (uncachedIndices.isEmpty()) return result;

        List<String> uncachedTexts = uncachedIndices.stream().map(stripped::get).toList();

        try {
            Map<String, Object> body = Map.of(
                    "model", model,
                    "task", task,
                    "dimensions", 768,
                    "input", uncachedTexts
            );

            String jsonBody = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(JINA_API_URL))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .timeout(TIMEOUT)
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                List<float[]> vectors = parseJinaEmbedding(response.body());
                for (int i = 0; i < uncachedIndices.size() && i < vectors.size(); i++) {
                    float[] v = vectors.get(i);
                    int originalIdx = uncachedIndices.get(i);
                    result.set(originalIdx, v);
                    if (v != null) cache.put(stripped.get(originalIdx), v);
                }
                return result;
            }

            log.error("EmbeddingService: Jina AI error status {}: {}", response.statusCode(), response.body());
            return result;

        } catch (Exception e) {
            log.error("EmbeddingService: request to Jina AI failed: {}", e.getMessage());
            return result;
        }
    }

    private List<float[]> parseJinaEmbedding(String rawResponse) {
        List<float[]> results = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode data = root.path("data");
            if (!data.isArray()) {
                log.warn("EmbeddingService: unexpected response — no data array");
                return results;
            }
            for (JsonNode item : data) {
                JsonNode embedding = item.path("embedding");
                if (!embedding.isArray() || embedding.isEmpty()) {
                    results.add(null);
                    continue;
                }
                float[] vector = new float[embedding.size()];
                for (int i = 0; i < embedding.size(); i++) {
                    vector[i] = (float) embedding.get(i).asDouble();
                }
                results.add(vector);
            }
        } catch (Exception e) {
            log.warn("EmbeddingService: failed to parse Jina response: {}", e.getMessage());
        }
        return results;
    }

    public void clearCache() {
        cache.clear();
    }

    public int cacheSize() {
        return cache.size();
    }
}
