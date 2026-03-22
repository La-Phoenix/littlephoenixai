export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ConversationHistory {
  id: string;
  messages: Message[];
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  documentId?: string;
}

export interface AskResponse {
  answer: string;
  sources?: string[];
  confidence?: number;
}

export interface SearchResult {
  id: string;
  content: string;
  score: number;
}

export interface APIError {
  message: string;
  code?: string;
  statusCode?: number;
}
