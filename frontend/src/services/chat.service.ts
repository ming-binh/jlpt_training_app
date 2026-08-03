import api from './api';

export const AiUseCase = {
  GRAMMAR_EXPLAIN: 'GRAMMAR_EXPLAIN',
  WRITING_CHECK: 'WRITING_CHECK',
  QUIZ_EXPLANATION: 'QUIZ_EXPLANATION',
  CONVERSATION: 'CONVERSATION',
  MOCK_ANALYSIS: 'MOCK_ANALYSIS',
} as const;

export type AiUseCase = (typeof AiUseCase)[keyof typeof AiUseCase];

export interface ChatRequest {
  useCase: AiUseCase;
  conversationId?: string;
  params: {
    user_message: string;
    [key: string]: any;
  };
  userContext?: {
    [key: string]: string;
  };
}

export interface ChatResponse {
  conversationId?: string;
  message: string;
  quiz?: any;
}

export interface ConversationItem {
  id: string;
  userId: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageHistoryItem {
  role: 'user' | 'model' | 'assistant';
  content: string;
  createdAt?: string;
}

export const chatService = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post('/ai/chat', request);
    return response.data;
  },

  getConversations: async (): Promise<ConversationItem[]> => {
    const response = await api.get('/ai/conversations');
    return response.data;
  },

  createConversation: async (title?: string): Promise<ConversationItem> => {
    const response = await api.post('/ai/conversations', { title });
    return response.data;
  },

  getMessages: async (conversationId: string): Promise<MessageHistoryItem[]> => {
    const response = await api.get(`/ai/conversations/${conversationId}/messages`);
    return response.data;
  },

  updateConversationTitle: async (conversationId: string, title: string): Promise<any> => {
    const response = await api.patch(`/ai/conversations/${conversationId}/title`, { title });
    return response.data;
  },

  deleteConversation: async (conversationId: string): Promise<any> => {
    const response = await api.delete(`/ai/conversations/${conversationId}`);
    return response.data;
  },
};
