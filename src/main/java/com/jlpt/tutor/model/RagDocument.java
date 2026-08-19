package com.jlpt.tutor.model;

/**
 * A retrieved knowledge document from the vector search.
 *
 * @param type       Content type: "GRAMMAR", "VOCABULARY", or "KANJI"
 * @param title      Display title (grammar title, word, or kanji character)
 * @param content    Full text content used for prompt injection
 * @param similarity Cosine similarity score [0.0, 1.0] — higher is more relevant
 */
public record RagDocument(String type, String title, String content, double similarity) {

    /** Formats this document as a single prompt-ready string. */
    public String toPromptLine() {
        return "[" + type + "] " + title + ": " + content;
    }
}
