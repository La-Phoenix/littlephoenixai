import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type {
  AskResponse,
  DocumentUploadResponse,
  APIError,
  ApiResponse,
  ChatResponseData,
  ChatRequest,
  AddDocRequest,
  AuthResponse,
  ChatMessageResponse,
  ConversationResponse,
} from '../types';

// Set credentials globally for all axios requests
axios.defaults.withCredentials = true;

class LittlePhoenixAPI {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = `${import.meta.env.VITE_API_BASE_URL}/api` || 'http://localhost:5000/api') {
    this.baseURL = baseURL;
    console.log('Initializing API with baseURL:', this.baseURL);
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      withCredentials: true, // Enable sending cookies with requests
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add any auth tokens if needed
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: APIError = {
          message: error.message,
          statusCode: error.response?.status,
          code: error.code,
        };
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Ask the AI assistant a question
   */
  async ask(question: string, conversationId?: string, isNewConversation: boolean = false): Promise<AskResponse> {
    try {
      const request: ChatRequest = {
        question,
        ...(conversationId ? { conversationId } : {}),
        ...(isNewConversation ? { isNewConversation } : { isNewConversation: false }),
      };
      const response = await this.instance.post<ApiResponse<ChatResponseData | ChatMessageResponse>>('/chat', request);
      
      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to get chat response');
      }

      const data = response.data.data as Partial<ChatResponseData & ChatMessageResponse>;
      const answer = data.content ?? data.message;

      if (!answer) {
        throw new Error('Invalid chat response from server');
      }
      
      // Transform backend response to our internal format
      return {
        answer,
        conversationId: data.conversationId,
        id: data.id,
        createdAt: data.createdAt,
        sources: [],
        confidence: undefined,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetch all conversations for current user
   */
  async getUserConversations(): Promise<ConversationResponse[]> {
    try {
      const response = await this.instance.get<ApiResponse<ConversationResponse[]>>('/chat/conversations/user');

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch conversations');
      }

      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetch all messages for a specific conversation
   */
  async getConversationMessages(conversationId?: string): Promise<ChatMessageResponse[]> {
    try {
      const params = conversationId ? { conversationId } : {};
      const response = await this.instance.get<ApiResponse<ChatMessageResponse[]>>('/chat/conversations/messages', {
        params,
      });

      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch conversation messages');
      }

      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload a document
   */
  async addDocument(text: string, _metadata?: Record<string, unknown>): Promise<DocumentUploadResponse> {
    try {
      const request: AddDocRequest = { text };
      const response = await this.instance.post<DocumentUploadResponse>('/vector/add', request);
      
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Failed to upload document');
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search documents in the database
   */
  async search(query: string, top: number = 3): Promise<{stringValue: string}[]> {
    try {
      const response = await this.instance.get<ApiResponse<{stringValue: string}[]>>('/vector/search', {
        params: { query, top },
      });
      
      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Search failed');
      }
      
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async checkAuth(): Promise<AuthResponse> {
    try {
      const fullUrl = `${this.baseURL}/auth/me`;
      console.log('Making auth check request to:', fullUrl);
      console.log('Credentials enabled:', this.instance.defaults.withCredentials);
      const response = await this.instance.get<ApiResponse<any>>('/auth/me');
      
      console.log('Raw response:', response.data);
      console.log('Response isSuccess:', response.data.isSuccess);
      console.log('Response data:', response.data.data);
      
      if (!response.data.isSuccess) {
        console.error('isSuccess is false');
        throw new Error(response.data.message || 'Not authenticated');
      }

      // Backend returns user object directly in data, not wrapped with isAuthenticated
      const user = response.data.data;
      if (!user || !user.id) {
        console.error('No user data in response');
        throw new Error('Invalid user data');
      }
      
      const authResponse: AuthResponse = {
        user,
        isAuthenticated: true,
      };
      
      console.log('Auth check successful, user:', user);
      return authResponse;
    } catch (error) {
      console.error('Auth check error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.instance.post('/auth/logout');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await this.instance.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): APIError {
    if (error instanceof axios.AxiosError) {
      return {
        message: error.response?.data?.message || error.message,
        statusCode: error.response?.status,
        code: error.code,
      };
    }
    return {
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }

  setBaseURL(baseURL: string) {
    this.baseURL = baseURL;
    this.instance.defaults.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    localStorage.setItem('auth_token', token);
    this.instance.defaults.headers.Authorization = `Bearer ${token}`;
  }

  clearAuthToken() {
    localStorage.removeItem('auth_token');
    delete this.instance.defaults.headers.Authorization;
  }
}

export const api = new LittlePhoenixAPI();
export default LittlePhoenixAPI;
