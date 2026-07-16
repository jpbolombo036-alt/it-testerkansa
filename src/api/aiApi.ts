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
  conversationId?: number;
}

export interface AiConversation {
  id: number;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiChatMessage {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: string;
}

export const sendAiMessage = async (request: AiChatRequest): Promise<AiChatResponse> => {
  const response = await api.post<AiChatResponse>('/ai/chat', request);
  return response.data;
};

export const sendAiMessageStream = async (
  request: AiChatRequest,
  onChunk: (chunk: string) => void
): Promise<AiChatResponse> => {
  const token = localStorage.getItem('accessToken');
  const baseUrl = api.defaults.baseURL || '';
  
  const response = await fetch(`${baseUrl}/ai/chat/stream`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullReply = '';
  let conversationId: number | undefined;
  let finalError: string | undefined;

  const parseSse = (text: string): { event: string; data: string }[] => {
    const events: { event: string; data: string }[] = [];
    const blocks = text.split('\n\n');
    for (let i = 0; i < blocks.length - 1; i++) {
      const block = blocks[i];
      if (!block.trim()) continue;
      const lines = block.split('\n');
      let event = 'message';
      let data = '';
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          event = line.slice(7);
        } else if (line.startsWith('data: ')) {
          data = line.slice(6);
        }
      }
      if (data) {
        events.push({ event, data });
      }
    }
    return events;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = parseSse(buffer);
    buffer = '';

    for (const evt of events) {
      if (evt.event === 'chunk') {
        fullReply = evt.data;
        onChunk(fullReply);
      } else if (evt.event === 'done') {
        try {
          const json = JSON.parse(evt.data);
          conversationId = json.conversationId;
        } catch {
          // ignore parse error
        }
      } else if (evt.event === 'error') {
        finalError = evt.data;
      }
    }
  }

  return {
    reply: fullReply,
    tokensUsed: 0,
    model: '',
    error: !!finalError,
    errorMessage: finalError,
    conversationId,
  };
};

export const getAiConversations = async (): Promise<AiConversation[]> => {
  const response = await api.get<AiConversation[]>('/ai/conversations');
  return response.data;
};

export const getAiConversationMessages = async (conversationId: number): Promise<AiChatMessage[]> => {
  const response = await api.get<AiChatMessage[]>(`/ai/conversations/${conversationId}/messages`);
  return response.data;
};

export const deleteAiConversation = async (conversationId: number): Promise<void> => {
  await api.delete(`/ai/conversations/${conversationId}`);
};

export const renameAiConversation = async (conversationId: number, title: string): Promise<AiConversation> => {
  const response = await api.put<AiConversation>(`/ai/conversations/${conversationId}`, { title });
  return response.data;
};
