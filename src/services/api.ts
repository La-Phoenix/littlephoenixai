import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type { AskResponse, DocumentUploadResponse, APIError } from '../types';

class LittlePhoenixAPI {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api') {
    this.baseURL = baseURL;
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
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
  async ask(question: string, conversationHistory?: string[]): Promise<AskResponse> {
    try {
      const response = await this.instance.post<AskResponse>('/ask', {
        question,
        conversationHistory: conversationHistory || [],
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload a document
   */
  async addDocument(text: string, metadata?: Record<string, unknown>): Promise<DocumentUploadResponse> {
    try {
      const response = await this.instance.post<DocumentUploadResponse>('/add-document', {
        text,
        metadata,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search documents (internal use)
   */
  async search(query: string, limit?: number) {
    try {
      const response = await this.instance.post('/search', {
        query,
        limit: limit || 10,
      });
      return response.data;
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
