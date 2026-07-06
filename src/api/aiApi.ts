import api from './axios';

export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiChatRequest {
  conversationId?: string;
  messages: AiMessage[];
}

export interface AiChatResponse {
  reply: string;
  tokensUsed: number;
  model: string;
  error: boolean;
  errorMessage?: string;
}

export const sendAiMessage = async (request: AiChatRequest): Promise<AiChatResponse> => {
  const response = await api.post<AiChatResponse>('/ai/chat', request);
  return response.data;
};
