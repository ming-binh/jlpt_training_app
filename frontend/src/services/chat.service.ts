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
  params: {
    user_message: string;
    [key: string]: any;
  };
  userContext?: {
    [key: string]: string;
  };
}

export interface ChatResponse {
  message: string;
}

export const chatService = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post('/ai/chat', request);
    return response.data;
  }
};
