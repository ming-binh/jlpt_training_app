package com.jlpt.tutor.service;

import com.jlpt.tutor.model.Message;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ConversationManager {

    private static final int MAX_HISTORY_TURNS = 6;

    public List<Message> buildContext(List<Message> history, String newMessage) {
        List<Message> trimmed = new ArrayList<>();
        
        if (history != null && history.size() > MAX_HISTORY_TURNS * 2) {
            trimmed.addAll(history.subList(history.size() - MAX_HISTORY_TURNS * 2, history.size()));
        } else if (history != null) {
            trimmed.addAll(history);
        }
        
        if (history != null && !history.isEmpty() && !trimmed.isEmpty() && trimmed.get(0) != history.get(0)) {
            trimmed.add(0, history.get(0));
        }
        
        trimmed.add(new Message("user", newMessage));
        return trimmed;
    }
}
