// ============================================
// ENUMS
// ============================================

export const ChatType = {
  DirectMessage: 'DirectMessage',
  GroupChat: 'GroupChat',
  RagAssistantGroup: 'RagAssistantGroup',
} as const;

export type ChatType = typeof ChatType[keyof typeof ChatType];

export const MessageRole = {
  User: 'User',
  Assistant: 'Assistant',
  System: 'System',
} as const;

export type MessageRole = typeof MessageRole[keyof typeof MessageRole];

// ============================================
// LEGACY/RAG TYPES
// ============================================

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
  conversationId?: string;
  isNewConversation?: boolean;
}

// Chat Response Data
export interface ChatResponseData {
  question: string;
  message: string;
}

export interface ChatMessageResponse {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  order: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ConversationResponse {
  id?: string;
  conversationId?: string;
  userId: string;
  title: string;
  isActive: boolean;
  messageCount: number;
  summary?: string | null;
  messages: ChatMessageResponse[];
  createdAt?: string;
  updatedAt?: string | null;
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
  conversationId?: string;
  id?: string;
  createdAt?: string;
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

// Auth Types
export interface User {
  id: string;
  name?: string;
  email?: string;
  pictureUrl?: string;
}

export interface AuthResponse {
  user: User;
  isAuthenticated: boolean;
}

// ============================================
// API REQUEST TYPES
// ============================================

export interface CreateDirectChatRequest {
  otherUserId: string; // UUID
  withAssistant: boolean; // true for User↔Assistant, false for User↔User
}

export interface CreateGroupChatRequest {
  name: string;
  memberUserIds: string[]; // Array of user UUIDs
}

export interface CreateRagAssistantGroupRequest {
  name: string;
  memberUserIds: string[]; // Array of user UUIDs (Assistant auto-added)
}

export interface SendMessageRequest {
  content: string;
  retrievalContext?: string; // Optional context from RAG retrieval
}

export interface UpdateChatRequest {
  name: string;
  description?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ChatMemberDto {
  id: string; // UUID
  chatId: string; // UUID
  userId?: string | null; // UUID (null if Assistant)
  displayName: string;
  isAssistant: boolean;
  joinedAt: string; // ISO 8601 DateTime
}

export interface RealtimeChatMemberDto extends ChatMemberDto {
  isOnline?: boolean;
  lastReadOrder?: number;
  lastReadAt?: string | null;
}

export interface ChatMessageDto {
  id: string; // UUID
  chatId: string; // UUID
  senderId: string; // ChatMember UUID
  content: string;
  role: MessageRole;
  retrievalContext?: string | null;
  order: number;
  createdAt: string; // ISO 8601 DateTime
  editedAt?: string | null; // ISO 8601 DateTime
}

export interface ChatDto {
  id: string; // UUID
  name: string;
  description?: string | null;
  type: ChatType;
  isActive: boolean;
  messageCount: number;
  lastMessageAt: string; // ISO 8601 DateTime
  createdAt: string; // ISO 8601 DateTime
  members: ChatMemberDto[];
}

export interface RealtimeChatDto extends Omit<ChatDto, 'members'> {
  members: RealtimeChatMemberDto[];
  currentUserLastReadOrder?: number;
  currentUserUnreadCount?: number;
}

export interface GetChatResponse {
  chat: ChatDto;
  messages: ChatMessageDto[];
}

// ============================================
// WEBSOCKET MESSAGE TYPES
// ============================================

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'user_joined' | 'user_left';
}

// Incoming from client
export interface WebSocketChatMessage {
  type: 'message';
  content: string;
  retrievalContext?: string; // Optional
}

export interface WebSocketTypingMessage {
  type: 'typing';
  isTyping: boolean;
}

// Incoming from server (broadcast)
export interface WebSocketMessageReceived {
  type: 'message';
  messageId: string; // UUID
  senderId: string; // ChatMember UUID
  senderName: string;
  content: string;
  role: MessageRole;
  retrievalContext?: string | null;
  createdAt: string; // ISO 8601 DateTime
  order: number;
}

export interface WebSocketTypingReceived {
  type: 'typing';
  userId: string; // User UUID
  isTyping: boolean;
}

export interface WebSocketUserJoined {
  type: 'user_joined';
  userId: string; // User UUID
  connectionId: string;
}

export interface WebSocketUserLeft {
  type: 'user_left';
  userId: string; // User UUID
  connectionId: string;
}

export type WebSocketServerMessage = 
  | WebSocketMessageReceived 
  | WebSocketTypingReceived 
  | WebSocketUserJoined 
  | WebSocketUserLeft;

export type WebSocketClientMessage = 
  | WebSocketChatMessage 
  | WebSocketTypingMessage;

// ============================================
// HELPER TYPES
// ============================================

export interface ChatUser {
  id: string;
  email: string;
  name: string;
  pictureUrl?: string;
}

export interface ChatSession {
  chatId: string;
  userId: string;
  ws: WebSocket;
  isConnected: boolean;
}

// Legacy Direct Chat Types (for backwards compatibility)
export interface DirectChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
}

export interface DirectChat {
  id: string;
  participantIds: string[];
  withAssistant: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DirectChatResponse {
  data: DirectChat;
}

export interface DirectChatCreateRequest {
  otherUserId: string;
  withAssistant: boolean;
}

export interface DirectChatMessageRequest {
  type: 'message' | 'typing';
  content?: string;
  isTyping?: boolean;
}

export interface DirectChatMessageEvent {
  type: 'message' | 'typing';
  messageId?: string;
  senderName?: string;
  senderId?: string;
  content?: string;
  role?: 'user' | 'assistant';
  createdAt?: string;
  userId?: string;
  isTyping?: boolean;
}
