package com.jlpt.tutor.service;

import com.jlpt.tutor.repository.GrammarPointRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("prod")
public class SyncGrammarTest {

    @Autowired
    private JlptDataSyncService jlptDataSyncService;

    @Autowired
    private GrammarPointRepository grammarPointRepository;

    @Test
    public void testSyncGrammar() {
        System.out.println("=== Running testSyncGrammar ===");
        Map<String, Object> result = jlptDataSyncService.syncGrammar();
        System.out.println("Sync Result: " + result);
        assertNotNull(result);


        long n5 = grammarPointRepository.countByJlptLevelIgnoreCase("N5");
        long n4 = grammarPointRepository.countByJlptLevelIgnoreCase("N4");
        long n3 = grammarPointRepository.countByJlptLevelIgnoreCase("N3");
        long n2 = grammarPointRepository.countByJlptLevelIgnoreCase("N2");
        long n1 = grammarPointRepository.countByJlptLevelIgnoreCase("N1");
        long total = grammarPointRepository.count();

        System.out.println(String.format("Current Grammar in DB: N5=%d, N4=%d, N3=%d, N2=%d, N1=%d, Total=%d",
                n5, n4, n3, n2, n1, total));
    }
}
