import * as signalR from "@microsoft/signalr";

export interface SignalRMessage {
  messageId: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  role: string;
  createdAt: string;
  order: number;
  retrievalContext?: string | null;
}

export interface SignalRTypingData {
  chatId?: string;
  userId: string;
  displayName: string;
  isTyping: boolean;
}

export interface SignalRUserPresence {
  userId: string;
  displayName: string;
}

export interface SignalRPresenceChanged {
  chatId: string;
  userId: string;
  isOnline: boolean;
}

export interface SignalRReadStateSynced {
  chatId: string;
  unreadCount: number;
  lastReadOrder: number;
}

export interface SignalRUnreadCountChanged {
  chatId: string;
  userId: string;
  unreadCount: number;
}

export interface SignalRMessageRead {
  chatId: string;
  readerUserId: string;
  lastReadOrder: number;
  readAt?: string;
}

export type SignalRCallback<T> = (data: T) => void;

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private connectPromise: Promise<void> | null = null;
  private baseURL: string;
  private messageListeners: Map<string, SignalRCallback<SignalRMessage>[]> = new Map();
  private typingListeners: Map<string, SignalRCallback<SignalRTypingData>[]> = new Map();
  private userJoinedListeners: Map<string, SignalRCallback<SignalRUserPresence>[]> = new Map();
  private userLeftListeners: Map<string, SignalRCallback<SignalRUserPresence>[]> = new Map();
  private presenceChangedListeners: Map<string, SignalRCallback<SignalRPresenceChanged>[]> = new Map();
  private readStateSyncedListeners: Map<string, SignalRCallback<SignalRReadStateSynced>[]> = new Map();
  private unreadCountChangedListeners: Map<string, SignalRCallback<SignalRUnreadCountChanged>[]> = new Map();
  private messageReadListeners: Map<string, SignalRCallback<SignalRMessageRead>[]> = new Map();
  private connectionStateListeners: SignalRCallback<boolean>[] = [];

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') {
    this.baseURL = baseURL.replace(/\/api$/, '');
  }

  /**
   * Connect to the SignalR hub
   */
  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('Already connected to SignalR hub');
      return;
    }

    if (this.connectPromise) {
      await this.connectPromise;
      return;
    }

    this.connectPromise = (async () => {
      try {
        const authToken = localStorage.getItem('auth_token');
        console.log('SignalR connect - Auth token present:', !!authToken, authToken ? `Token length: ${authToken.length}` : '');

        if (!this.connection) {
          this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.baseURL}/api/chat-hub`, {
              accessTokenFactory: () => {
                const token = localStorage.getItem('auth_token');
                console.log('accessTokenFactory called - token present:', !!token);
                return token || '';
              },
              withCredentials: true,
            })
            .withAutomaticReconnect([0, 0, 1000, 3000, 5000, 10000])
            .build();

          // Set up event listeners once for this connection instance
          this.setupEventListeners();
        }

        if (this.connection.state === signalR.HubConnectionState.Disconnected) {
          await this.connection.start();
        }

        if (this.connection.state !== signalR.HubConnectionState.Connected) {
          throw new Error(`SignalR connection state is ${this.connection.state}`);
        }

        console.log('✅ Connected to SignalR hub');
        this.notifyConnectionStateListeners(true);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('❌ Failed to connect to SignalR hub:', errorMsg, 'Full error:', error);
        this.notifyConnectionStateListeners(false);
        throw error;
      } finally {
        this.connectPromise = null;
      }
    })();

    await this.connectPromise;
  }

  /**
   * Disconnect from the hub
   */
  async disconnect(): Promise<void> {
    if (!this.connection) return;

    try {
      await this.connection.stop();
      console.log('🔌 Disconnected from SignalR hub');
      this.notifyConnectionStateListeners(false);
    } catch (error) {
      console.error('Error disconnecting from hub:', error);
    }
  }

  /**
   * Join a chat room
   */
  async joinChat(chatId: string): Promise<void> {
    if (this.connection?.state !== signalR.HubConnectionState.Connected) {
      await this.connect();
    }

    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error(`Not connected to SignalR hub (state: ${this.connection?.state ?? 'none'})`);
    }

    try {
      console.log(`Attempting to join chat: ${chatId}`);
      await this.connection.invoke('JoinChat', chatId);
      console.log(`✅ Joined chat: ${chatId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to join chat ${chatId}:`, { error: errorMessage, fullError: error });
      
      // Check if it's an auth error
      if (errorMessage.toLowerCase().includes('unauthorized') || 
          errorMessage.toLowerCase().includes('authorize') ||
          errorMessage.toLowerCase().includes('401')) {
        throw new Error(`❌ Authentication Error: Cannot access this chat. Your session may have expired. Details: ${errorMessage}`);
      }
      
      throw error;
    }
  }

  /**
   * Leave a chat room
   */
  async leaveChat(chatId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('LeaveChat', chatId);
      console.log(`Left chat: ${chatId}`);
    } catch (error) {
      console.error(`Failed to leave chat ${chatId}:`, error);
    }
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(chatId: string, content: string, _retrievalContext?: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Not connected to SignalR hub');
    }

    try {
        console.log('Sending message:', { chatId, content: content.substring(0, 50) });
        // Backend SendMessage expects only 2 arguments: (chatId, content)
        await this.connection.invoke('SendMessage', chatId, content);
      console.log('✅ Message sent successfully');
    } catch (error) {
      // Extract detailed error message from SignalR error object
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = (error as any).message || JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }
      
      console.error('❌ Failed to send message:', { 
        chatId, 
        error: errorMessage,
        fullError: error,
        connectedState: this.connection?.state
      });
      
      // Check if it's an auth error
      if (errorMessage.toLowerCase().includes('unauthorized') || 
          errorMessage.toLowerCase().includes('authorize') ||
          errorMessage.toLowerCase().includes('401')) {
        throw new Error(`❌ Authentication Error: Your session may have expired. Please log in again. Details: ${errorMessage}`);
      }
      
      throw new Error(`Failed to send message: ${errorMessage}`);
    }
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(chatId: string, isTyping: boolean): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('SendTypingIndicator', chatId, isTyping);
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
    }
  }

  /**
   * Mark chat messages as read up to the given message order
   */
  async markAsRead(chatId: string, lastReadOrder: number): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('MarkAsRead', chatId, lastReadOrder);
    } catch (error) {
      // Fallback for backends expecting object payload style
      try {
        await this.connection.invoke('MarkAsRead', { chatId, lastReadOrder });
      } catch (fallbackError) {
        console.error('Failed to mark chat as read:', { error, fallbackError, chatId, lastReadOrder });
      }
    }
  }

  /**
   * Subscribe to incoming messages for a chat
   */
  onMessage(chatId: string, callback: SignalRCallback<SignalRMessage>): () => void {
    if (!this.messageListeners.has(chatId)) {
      this.messageListeners.set(chatId, []);
    }
    this.messageListeners.get(chatId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.messageListeners.get(chatId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to typing indicators for a chat
   */
  onTyping(chatId: string, callback: SignalRCallback<SignalRTypingData>): () => void {
    if (!this.typingListeners.has(chatId)) {
      this.typingListeners.set(chatId, []);
    }
    this.typingListeners.get(chatId)!.push(callback);

    return () => {
      const listeners = this.typingListeners.get(chatId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to user joined events for a chat
   */
  onUserJoined(chatId: string, callback: SignalRCallback<SignalRUserPresence>): () => void {
    if (!this.userJoinedListeners.has(chatId)) {
      this.userJoinedListeners.set(chatId, []);
    }
    this.userJoinedListeners.get(chatId)!.push(callback);

    return () => {
      const listeners = this.userJoinedListeners.get(chatId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to user left events for a chat
   */
  onUserLeft(chatId: string, callback: SignalRCallback<SignalRUserPresence>): () => void {
    if (!this.userLeftListeners.has(chatId)) {
      this.userLeftListeners.set(chatId, []);
    }
    this.userLeftListeners.get(chatId)!.push(callback);

    return () => {
      const listeners = this.userLeftListeners.get(chatId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to live online presence changes for a chat
   */
  onPresenceChanged(chatId: string, callback: SignalRCallback<SignalRPresenceChanged>): () => void {
    if (!this.presenceChangedListeners.has(chatId)) {
      this.presenceChangedListeners.set(chatId, []);
    }
    this.presenceChangedListeners.get(chatId)!.push(callback);

    return () => {
      const listeners = this.presenceChangedListeners.get(chatId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  onReadStateSynced(chatId: string, callback: SignalRCallback<SignalRReadStateSynced>): () => void {
    if (!this.readStateSyncedListeners.has(chatId)) {
      this.readStateSyncedListeners.set(chatId, []);
    }
    this.readStateSyncedListeners.get(chatId)!.push(callback);

    return () => {
      const listeners = this.readStateSyncedListeners.get(chatId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  onUnreadCountChanged(chatId: string, callback: SignalRCallback<SignalRUnreadCountChanged>): () => void {
    if (!this.unreadCountChangedListeners.has(chatId)) {
      this.unreadCountChangedListeners.set(chatId, []);
    }
    this.unreadCountChangedListeners.get(chatId)!.push(callback);

    return () => {
      const listeners = this.unreadCountChangedListeners.get(chatId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  onMessageRead(chatId: string, callback: SignalRCallback<SignalRMessageRead>): () => void {
    if (!this.messageReadListeners.has(chatId)) {
      this.messageReadListeners.set(chatId, []);
    }
    this.messageReadListeners.get(chatId)!.push(callback);

    return () => {
      const listeners = this.messageReadListeners.get(chatId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to connection state changes
   */
  onConnectionStateChange(callback: SignalRCallback<boolean>): () => void {
    this.connectionStateListeners.push(callback);

    return () => {
      const index = this.connectionStateListeners.indexOf(callback);
      if (index > -1) {
        this.connectionStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Private method to set up server event listeners
   */
  private setupEventListeners(): void {
    if (!this.connection) return;

    // Listen for incoming messages
    this.connection.on('receive_message', (message: SignalRMessage) => {
      console.log('Received message:', message);
      const listeners = this.messageListeners.get(message.chatId) || [];
      listeners.forEach(callback => callback(message));
    });

    // Listen for typing indicators
    this.connection.on('user_typing', (data: SignalRTypingData) => {
      console.log('User typing:', data);
      if (!data.chatId) {
        console.warn('user_typing payload missing chatId:', data);
        return;
      }

      const listeners = this.typingListeners.get(data.chatId) || [];
      listeners.forEach(callback => callback(data));
    });

    // Listen for user joined
    this.connection.on('user_joined', (data: SignalRUserPresence & { chatId?: string }) => {
      console.log('User joined:', data);
      const listeners = this.userJoinedListeners.get(data.chatId || data.userId) || [];
      listeners.forEach(callback => callback(data));
    });

    // Listen for user left
    this.connection.on('user_left', (data: SignalRUserPresence & { chatId?: string }) => {
      console.log('User left:', data);
      const listeners = this.userLeftListeners.get(data.chatId || data.userId) || [];
      listeners.forEach(callback => callback(data));
    });

    // Listen for presence changes
    this.connection.on('presence_changed', (data: SignalRPresenceChanged) => {
      console.log('Presence changed:', data);
      const listeners = this.presenceChangedListeners.get(data.chatId) || [];
      listeners.forEach(callback => callback(data));
    });

    this.connection.on('read_state_synced', (data: SignalRReadStateSynced) => {
      const listeners = this.readStateSyncedListeners.get(data.chatId) || [];
      listeners.forEach(callback => callback(data));
    });

    this.connection.on('unread_count_changed', (data: SignalRUnreadCountChanged) => {
      const listeners = this.unreadCountChangedListeners.get(data.chatId) || [];
      listeners.forEach(callback => callback(data));
    });

    this.connection.on('message_read', (data: SignalRMessageRead) => {
      const listeners = this.messageReadListeners.get(data.chatId) || [];
      listeners.forEach(callback => callback(data));
    });

    // Handle disconnection
    this.connection.onreconnecting(() => {
      console.log('Reconnecting to SignalR hub...');
      this.notifyConnectionStateListeners(false);
    });

    this.connection.onreconnected(() => {
      console.log('Reconnected to SignalR hub');
      this.notifyConnectionStateListeners(true);
    });

    this.connection.onclose(() => {
      console.log('Connection closed');
      this.notifyConnectionStateListeners(false);
    });
  }

  /**
   * Notify all connection state listeners
   */
  private notifyConnectionStateListeners(isConnected: boolean): void {
    this.connectionStateListeners.forEach(callback => callback(isConnected));
  }

  /**
   * Clear all listeners (useful for cleanup)
   */
  clearAllListeners(): void {
    this.messageListeners.clear();
    this.typingListeners.clear();
    this.userJoinedListeners.clear();
    this.userLeftListeners.clear();
    this.presenceChangedListeners.clear();
    this.readStateSyncedListeners.clear();
    this.unreadCountChangedListeners.clear();
    this.messageReadListeners.clear();
  }
}

export const signalRService = new SignalRService();
export default SignalRService;
