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

// Backend Response Wrapper
export interface ApiResponse<T> {
  message: string;
  data: T | null;
  isSuccess: boolean;
}

// Chat Request
export interface ChatRequest {
  question: string;
}

// Chat Response Data
export interface ChatResponseData {
  question: string;
  message: string;
}

// Document Upload Request
export interface AddDocRequest {
  text: string;
}

// Document Upload Response (wrapped in ApiResponse)
export type DocumentUploadResponse = ApiResponse<string>;

// Ask Response - what we use internally
export interface AskResponse {
  answer: string;
  sources?: string[];
  confidence?: number;
}

// Search Result
export interface SearchResult {
  id: string;
  content: string;
  score: number;
}

// API Error
export interface APIError {
  message: string;
  code?: string;
  statusCode?: number;
}
