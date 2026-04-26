import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';
import { signalRService } from '../services/signalr';
import { useAuth } from '../hooks/useAuth';
import type {
  ChatMessageDto,
  ChatDto,
  MessageRole,
  CreateDirectChatRequest,
} from '../types';

export interface DirectChatContextType {
  // Chat state
  activeChat: ChatDto | null;
  messages: ChatMessageDto[];
  isTyping: Record<string, boolean>;
  onlineByUserId: Record<string, boolean>;
  unreadByChatId: Record<string, number>;
  totalUnreadCount: number;
  myLastReadOrderByChatId: Record<string, number>;
  peerLastReadOrderByChatId: Record<string, Record<string, number>>;
  isLoadingChat: boolean;
  isSendingMessage: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  // Actions
  createDirectChat: (otherUserId: string) => Promise<string>;
  selectChat: (chatId: string) => Promise<void>;
  sendMessage: (content: string, retrievalContext?: string) => void;
  setTyping: (isTyping: boolean) => void;
  markAsRead: (lastReadOrder: number) => Promise<void>;
  isUserOnline: (userId?: string | null) => boolean;
  disconnect: () => void;
  clearError: () => void;
}

const defaultContextValue: DirectChatContextType = {
  activeChat: null,
  messages: [],
  isTyping: {},
  onlineByUserId: {},
  unreadByChatId: {},
  totalUnreadCount: 0,
  myLastReadOrderByChatId: {},
  peerLastReadOrderByChatId: {},
  isLoadingChat: false,
  isSendingMessage: false,
  isConnected: false,
  isConnecting: false,
  error: null,
  createDirectChat: async () => '',
  selectChat: async () => {},
  sendMessage: () => {},
  setTyping: () => {},
  markAsRead: async () => {},
  isUserOnline: () => false,
  disconnect: () => {},
  clearError: () => {},
};

export const DirectChatContext = createContext<DirectChatContextType>(defaultContextValue);

interface DirectChatProviderProps {
  children: ReactNode;
}

export const DirectChatProvider: React.FC<DirectChatProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [activeChat, setActiveChat] = useState<ChatDto | null>(null);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [isTyping, setIsTypingState] = useState<Record<string, boolean>>({});
  const [onlineByUserId, setOnlineByUserId] = useState<Record<string, boolean>>({});
  const [unreadByChatId, setUnreadByChatId] = useState<Record<string, number>>({});
  const [myLastReadOrderByChatId, setMyLastReadOrderByChatId] = useState<Record<string, number>>({});
  const [peerLastReadOrderByChatId, setPeerLastReadOrderByChatId] = useState<Record<string, Record<string, number>>>({});
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presenceRefreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsubscribeListenersRef = useRef<Array<() => void>>([]);
  const activeJoinedChatIdRef = useRef<string | null>(null);

  const buildOnlineMap = useCallback((members: Array<{ userId?: string | null; isOnline?: boolean }>) => {
    const map: Record<string, boolean> = {};
    for (const member of members || []) {
      if (member.userId) {
        map[member.userId] = !!member.isOnline;
      }
    }
    return map;
  }, []);

  const refreshPresenceSnapshot = useCallback(async (chatId: string, retries: number = 1) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const realtimeChat = await api.getRealtimeChat(chatId);
        const snapshotMap = buildOnlineMap(realtimeChat.members);

        // Merge snapshot into current state so missing users in a transient
        // snapshot do not get forced offline.
        setOnlineByUserId((prev) => ({
          ...prev,
          ...snapshotMap,
        }));

        if (typeof realtimeChat.currentUserUnreadCount === 'number') {
          setUnreadByChatId((prev) => ({
            ...prev,
            [chatId]: Math.max(0, realtimeChat.currentUserUnreadCount ?? 0),
          }));
        }

        if (typeof realtimeChat.currentUserLastReadOrder === 'number') {
          setMyLastReadOrderByChatId((prev) => ({
            ...prev,
            [chatId]: realtimeChat.currentUserLastReadOrder ?? 0,
          }));
        }

        setPeerLastReadOrderByChatId((prev) => {
          const current = { ...(prev[chatId] || {}) };
          for (const member of realtimeChat.members || []) {
            const key = member.userId || member.id;
            if (!key || key === user?.id) {
              continue;
            }
            if (typeof member.lastReadOrder === 'number') {
              current[key] = member.lastReadOrder;
            }
          }
          return {
            ...prev,
            [chatId]: current,
          };
        });
        return;
      } catch (presenceErr) {
        if (attempt === retries) {
          // Keep the current presence map if snapshot fetch fails to avoid false offline UI.
          console.warn('Failed to refresh presence snapshot:', presenceErr);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
      }
    }
  }, [buildOnlineMap, user?.id]);

  const scheduleDelayedPresenceRefresh = useCallback((chatId: string, delayMs: number = 1200) => {
    if (presenceRefreshTimeoutRef.current) {
      clearTimeout(presenceRefreshTimeoutRef.current);
    }

    presenceRefreshTimeoutRef.current = setTimeout(() => {
      void refreshPresenceSnapshot(chatId, 2);
    }, delayMs);
  }, [refreshPresenceSnapshot]);

  // Clean up SignalR listeners on unmount
  useEffect(() => {
    return () => {
      // Unsubscribe from all listeners
      unsubscribeListenersRef.current.forEach(unsub => unsub());
      unsubscribeListenersRef.current = [];
      
      if (presenceRefreshTimeoutRef.current) {
        clearTimeout(presenceRefreshTimeoutRef.current);
      }

      const joinedChatId = activeJoinedChatIdRef.current;
      if (joinedChatId) {
        void signalRService.leaveChat(joinedChatId);
      }
      void signalRService.disconnect();
    };
  }, []);

  // Set up global connection state listener
  useEffect(() => {
    const unsubConnectionState = signalRService.onConnectionStateChange((isConnected) => {
      console.log('SignalR connection state changed:', isConnected);
      setIsConnected(isConnected);

      // After reconnect, SignalR group membership is not guaranteed.
      // Rejoin active chat and refresh presence snapshot.
      if (isConnected && activeJoinedChatIdRef.current) {
        const joinedChatId = activeJoinedChatIdRef.current;
        void (async () => {
          try {
            await signalRService.joinChat(joinedChatId);
            await refreshPresenceSnapshot(joinedChatId, 2);
            scheduleDelayedPresenceRefresh(joinedChatId);
            setError(null);
          } catch (rejoinErr) {
            console.error('Failed to rejoin chat after reconnect:', rejoinErr);
          }
        })();
      }

      if (!isConnected && activeChat) {
        setError('Connection lost. Attempting to reconnect...');
      }
    });

    return () => {
      unsubConnectionState();
    };
  }, [activeChat, refreshPresenceSnapshot, scheduleDelayedPresenceRefresh]);

  const connectSignalR = useCallback(async (chatId: string) => {
    try {
      setIsConnecting(true);
      setError(null);
      console.log('Starting SignalR connection for chat:', chatId);

      // Clear previous listeners for this chat switch
      unsubscribeListenersRef.current.forEach(unsub => unsub());
      unsubscribeListenersRef.current = [];

      // Leave the previously joined chat room before switching
      if (activeJoinedChatIdRef.current && activeJoinedChatIdRef.current !== chatId) {
        await signalRService.leaveChat(activeJoinedChatIdRef.current);
        await signalRService.disconnect();
        activeJoinedChatIdRef.current = null;
      }

      // Ensure SignalR is connected
      if (!signalRService.isConnected()) {
        console.log('SignalR not connected, establishing connection...');
        await signalRService.connect();
        console.log('✅ SignalR connected');
      }

      // Join the chat room
      console.log(`Joining chat: ${chatId}`);
      await signalRService.joinChat(chatId);
      activeJoinedChatIdRef.current = chatId;
      console.log('✅ Joined chat');

      // Seed/refresh presence from REST right after joining.
      await refreshPresenceSnapshot(chatId, 2);
      scheduleDelayedPresenceRefresh(chatId);

      // Set up message listener
      const unsubMessage = signalRService.onMessage(chatId, (message) => {
        console.log('Received message via SignalR:', message);
        setMessages((prev) => {
          const incomingId = message.messageId;

          // Avoid rendering duplicates when the same message is seen from
          // history + realtime, or when listeners are registered twice in dev.
          if (incomingId && prev.some((m) => m.id === incomingId)) {
            return prev;
          }

          return [
            ...prev,
            {
              id: incomingId,
              chatId: message.chatId,
              senderId: message.senderId,
              content: message.content,
              role: message.role as MessageRole,
              retrievalContext: message.retrievalContext,
              order: message.order,
              createdAt: message.createdAt,
            },
          ];
        });
      });

      // Set up typing indicator listener
      const unsubTyping = signalRService.onTyping(chatId, (data) => {
        console.log('User typing:', data);
        setIsTypingState((prev) => ({
          ...prev,
          [data.userId]: data.isTyping,
        }));
      });

      // Set up user presence listeners
      const unsubUserJoined = signalRService.onUserJoined(chatId, (data) => {
        console.log('User joined:', data);
      });

      const unsubUserLeft = signalRService.onUserLeft(chatId, (data) => {
        console.log('User left:', data);
      });

      const unsubPresenceChanged = signalRService.onPresenceChanged(chatId, (data) => {
        if (!data || data.chatId !== chatId || !data.userId) {
          return;
        }

        setOnlineByUserId((prev) => ({
          ...prev,
          [data.userId]: data.isOnline,
        }));
      });

      const unsubReadStateSynced = signalRService.onReadStateSynced(chatId, (data) => {
        setUnreadByChatId((prev) => ({
          ...prev,
          [data.chatId]: Math.max(0, data.unreadCount),
        }));
        setMyLastReadOrderByChatId((prev) => ({
          ...prev,
          [data.chatId]: data.lastReadOrder,
        }));
      });

      const unsubUnreadCountChanged = signalRService.onUnreadCountChanged(chatId, (data) => {
        if (data.userId !== user?.id) {
          return;
        }
        setUnreadByChatId((prev) => ({
          ...prev,
          [data.chatId]: Math.max(0, data.unreadCount),
        }));
      });

      const unsubMessageRead = signalRService.onMessageRead(chatId, (data) => {
        if (!data.readerUserId || data.readerUserId === user?.id) {
          return;
        }

        setPeerLastReadOrderByChatId((prev) => ({
          ...prev,
          [data.chatId]: {
            ...(prev[data.chatId] || {}),
            [data.readerUserId]: data.lastReadOrder,
          },
        }));
      });

      // Store unsubscribe functions
      unsubscribeListenersRef.current.push(
        unsubMessage,
        unsubTyping,
        unsubUserJoined,
        unsubUserLeft,
        unsubPresenceChanged,
        unsubReadStateSynced,
        unsubUnreadCountChanged,
        unsubMessageRead
      );

      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      console.log('✅ SignalR listeners set up successfully');
    } catch (err) {
      console.error('Failed to connect SignalR:', err);
      const message = err instanceof Error ? err.message : 'Failed to connect to chat service. Please try again.';
      setError(`Connection error: ${message}`);
      setIsConnected(false);
      setIsConnecting(false);
      
      // Don't throw - let the UI handle the error state
      return;
    }
  }, [refreshPresenceSnapshot, scheduleDelayedPresenceRefresh, user?.id]);

  const createDirectChat = useCallback(
    async (otherUserId: string) => {
      if (!isAuthenticated || !user) {
        const error = 'You must be authenticated to create a chat';
        setError(error);
        throw new Error(error);
      }

      try {
        setIsLoadingChat(true);
        setError(null);

        const request: CreateDirectChatRequest = {
          otherUserId,
          withAssistant: false,
        };

        const chat = await api.createChat(request);

        // Load current online presence from REST before opening realtime room
        await refreshPresenceSnapshot(chat.id, 2);

        setActiveChat(chat);
        setMessages([]);
        setIsTypingState({});

        // Connect to SignalR
        await connectSignalR(chat.id);

        return chat.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create chat';
        setError(message);
        console.error('Create direct chat error:', err);
        throw err;
      } finally {
        setIsLoadingChat(false);
      }
    },
      [isAuthenticated, user, connectSignalR, refreshPresenceSnapshot]
  );

  const selectChat = useCallback(
    async (chatId: string) => {
      try {
        setIsLoadingChat(true);
        setError(null);

        // 1) Load realtime members from REST first for initial online state
        await refreshPresenceSnapshot(chatId, 2);

        // 2) Load chat + messages
        const { chat, messages: chatMessages } = await api.getChat(chatId);

        setActiveChat(chat);
        setMessages(chatMessages);
        setIsTypingState({});

        // Connect to SignalR
        await connectSignalR(chatId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load chat';
        setError(message);
        console.error('Select chat error:', err);
      } finally {
        setIsLoadingChat(false);
      }
    },
      [connectSignalR, refreshPresenceSnapshot]
  );

  const isUserOnline = useCallback(
    (userId?: string | null) => {
      if (!userId) return false;
      return !!onlineByUserId[userId];
    },
    [onlineByUserId]
  );

  const sendMessage = useCallback(
    async (content: string, retrievalContext?: string) => {
      if (!activeChat) {
        setError('No active chat selected');
        console.error('sendMessage: No active chat');
        return;
      }

      if (!content.trim()) {
        setError('Message cannot be empty');
        return;
      }

      try {
        setIsSendingMessage(true);
        setError(null);
        console.log('sendMessage: Sending message to chat', {
          chatId: activeChat.id,
          contentLength: content.length,
          hasRetrievalContext: !!retrievalContext,
        });
        await signalRService.sendMessage(activeChat.id, content, retrievalContext);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMsg);
        console.error('Send message error:', { error: err, chatId: activeChat?.id });
      } finally {
        setIsSendingMessage(false);
      }
    },
    [activeChat]
  );

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!activeChat) return;

    try {
      await signalRService.sendTypingIndicator(activeChat.id, isTyping);
    } catch (err) {
      console.error('Failed to send typing indicator:', err);
    }
  }, [activeChat]);

  const markAsRead = useCallback(async (lastReadOrder: number) => {
    if (!activeChat || !Number.isFinite(lastReadOrder)) {
      return;
    }

    const safeOrder = Math.max(0, Math.floor(lastReadOrder));

    setMyLastReadOrderByChatId((prev) => ({
      ...prev,
      [activeChat.id]: Math.max(prev[activeChat.id] ?? 0, safeOrder),
    }));
    setUnreadByChatId((prev) => ({
      ...prev,
      [activeChat.id]: 0,
    }));

    await signalRService.markAsRead(activeChat.id, safeOrder);
  }, [activeChat]);

  const disconnect = useCallback(async () => {
    // Unsubscribe from all listeners
    unsubscribeListenersRef.current.forEach(unsub => unsub());
    unsubscribeListenersRef.current = [];

    if (activeChat) {
      try {
        await signalRService.leaveChat(activeChat.id);
      } catch (err) {
        console.error('Failed to leave chat:', err);
      }
    }

    activeJoinedChatIdRef.current = null;
    await signalRService.disconnect();

    if (presenceRefreshTimeoutRef.current) {
      clearTimeout(presenceRefreshTimeoutRef.current);
    }

    setActiveChat(null);
    setMessages([]);
    setIsTypingState({});
    setOnlineByUserId({});
    setUnreadByChatId({});
    setMyLastReadOrderByChatId({});
    setPeerLastReadOrderByChatId({});
    setIsConnected(false);
  }, [activeChat]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const totalUnreadCount = Object.values(unreadByChatId).reduce((sum, count) => sum + Math.max(0, count || 0), 0);

  const value: DirectChatContextType = {
    activeChat,
    messages,
    isTyping,
    onlineByUserId,
    unreadByChatId,
    totalUnreadCount,
    myLastReadOrderByChatId,
    peerLastReadOrderByChatId,
    isLoadingChat,
    isSendingMessage,
    isConnected,
    isConnecting,
    error,
    createDirectChat,
    selectChat,
    sendMessage,
    setTyping,
    markAsRead,
    isUserOnline,
    disconnect,
    clearError,
  };

  return (
    <DirectChatContext.Provider value={value}>
      {children}
    </DirectChatContext.Provider>
  );
};
