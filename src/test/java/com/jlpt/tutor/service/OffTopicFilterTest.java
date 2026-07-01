package com.jlpt.tutor.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class OffTopicFilterTest {

    private final OffTopicFilter filter = new OffTopicFilter();

    @Test
    void testIsOnTopic_ValidJapaneseTopics() {
        assertTrue(filter.isOnTopic("hướng dẫn tôi học ngữ pháp N4"));
        assertTrue(filter.isOnTopic("từ vựng N3 bài 1"));
        assertTrue(filter.isOnTopic("cách viết chữ hán tự này thế nào?"));
        assertTrue(filter.isOnTopic("What is the meaning of this kanji?"));
        assertTrue(filter.isOnTopic("jlpt mock test"));
    }

    @Test
    void testIsOnTopic_OffTopic() {
        assertFalse(filter.isOnTopic("thời tiết hôm nay thế nào?"));
        assertFalse(filter.isOnTopic("chỉ tôi cách học tiếng anh"));
        assertFalse(filter.isOnTopic("giá vàng hôm nay"));
    }

    @Test
    void testIsOnTopic_NullOrEmpty() {
        assertFalse(filter.isOnTopic(null));
        assertFalse(filter.isOnTopic(""));
        assertFalse(filter.isOnTopic("   "));
    }
}
