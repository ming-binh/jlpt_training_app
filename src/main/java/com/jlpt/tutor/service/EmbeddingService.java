package com.jlpt.tutor.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Generates text embeddings via Gemini gemini-embedding-001 API.
 *
 * Supports both single embed() and batch embedBatch() (up to 100 texts/request).
 * Results are cached in-memory to avoid redundant API calls.
 * Retries with exponential backoff on 429 rate-limit errors.
 */
@Slf4j
@Service
public class EmbeddingService {

    private static final String EMBEDDING_BASE_URL = "https://generativelanguage.googleapis.com";
    private static final Duration TIMEOUT = Duration.ofSeconds(180);
    private static final int MAX_BATCH_SIZE = 100;

    private final String apiKey;
    private final String model;
    private final WebClient embeddingClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Simple in-memory cache: text -> embedding vector
    private final ConcurrentHashMap<String, float[]> cache = new ConcurrentHashMap<>();

    public EmbeddingService(
            @Value("${GEMINI_API_KEY}") String apiKey,
            @Value("${rag.embedding-model:gemini-embedding-001}") String model) {
        this.apiKey = apiKey;
        this.model = model;
        this.embeddingClient = WebClient.builder()
                .baseUrl(EMBEDDING_BASE_URL)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    /**
     * Returns a 768-dim embedding vector for a single text.
     * Retries with exponential backoff on 429. Returns null on failure.
     */
    public float[] embed(String text) {
        if (text == null || text.isBlank()) return null;
        List<float[]> results = embedBatch(List.of(text.strip()));
        return results.isEmpty() ? null : results.get(0);
    }

    /**
     * Returns 768-dim embedding vectors for a batch of texts (up to 100).
     * Uses batchEmbedContents API — 1 HTTP request for up to 100 texts.
     * Retries with exponential backoff on 429. Returns empty list on total failure.
     * Individual null entries in the returned list indicate per-item failures.
     */
    public List<float[]> embedBatch(List<String> texts) {
        if (texts == null || texts.isEmpty()) return Collections.emptyList();

        // Check cache first — only call API for uncached texts
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

        // Build batch request for uncached texts only
        List<Map<String, Object>> requests = new ArrayList<>();
        for (int idx : uncachedIndices) {
            requests.add(Map.of(
                    "model", "models/" + model,
                    "content", Map.of("parts", new Object[]{Map.of("text", stripped.get(idx))}),
                    "outputDimensionality", 768
            ));
        }

        long backoffMs = 10000; // start at 10s, doubles: 10→20→40→80→160
        for (int attempt = 1; attempt <= 6; attempt++) {
            try {
                String uri = "/v1beta/models/" + model + ":batchEmbedContents";
                Map<String, Object> body = Map.of("requests", requests);

                String rawResponse = embeddingClient.post()
                        .uri(uri)
                        .header("x-goog-api-key", apiKey)
                        .bodyValue(body)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block(TIMEOUT);

                List<float[]> vectors = parseBatchEmbedding(rawResponse);
                if (vectors.size() != uncachedIndices.size()) {
                    log.warn("EmbeddingService: batch response size mismatch ({} vs {})",
                            vectors.size(), uncachedIndices.size());
                }

                for (int i = 0; i < uncachedIndices.size() && i < vectors.size(); i++) {
                    float[] v = vectors.get(i);
                    int originalIdx = uncachedIndices.get(i);
                    result.set(originalIdx, v);
                    if (v != null) cache.put(stripped.get(originalIdx), v);
                }

                return result;

            } catch (Exception e) {
                String msg = e.getMessage() != null ? e.getMessage() : "";
                boolean isRateLimit = msg.contains("429") || msg.contains("Too Many Requests");

                if (isRateLimit && attempt < 6) {
                    log.warn("EmbeddingService: 429 rate-limit on batch (attempt {}/6), backing off {}ms",
                            attempt, backoffMs);
                    try { Thread.sleep(backoffMs); } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return result;
                    }
                    backoffMs = Math.min(backoffMs * 2, 180_000); // cap at 3 min
                } else {
                    log.warn("EmbeddingService: batch embed failed (size={}, attempt {}): {}",
                            uncachedIndices.size(), attempt, msg);
                    return result; // partial result — nulls for uncached items
                }
            }
        }
        return result;
    }

    private List<float[]> parseBatchEmbedding(String rawResponse) {
        List<float[]> results = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode embeddings = root.path("embeddings");
            if (!embeddings.isArray()) {
                log.warn("EmbeddingService: unexpected batch response — no embeddings array");
                return results;
            }
            for (JsonNode embedding : embeddings) {
                JsonNode values = embedding.path("values");
                if (!values.isArray() || values.isEmpty()) {
                    results.add(null);
                    continue;
                }
                float[] vector = new float[values.size()];
                for (int i = 0; i < values.size(); i++) {
                    vector[i] = (float) values.get(i).asDouble();
                }
                results.add(vector);
            }
        } catch (Exception e) {
            log.warn("EmbeddingService: failed to parse batch embedding response: {}", e.getMessage());
        }
        return results;
    }

    /** Clears the in-memory cache (useful for testing or memory pressure). */
    public void clearCache() {
        cache.clear();
    }

    public int cacheSize() {
        return cache.size();
    }
}
