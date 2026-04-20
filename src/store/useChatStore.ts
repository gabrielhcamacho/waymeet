import { create } from 'zustand';
import { ChatMessage } from '../types';
import { MOCK_MESSAGES, MOCK_USERS } from '../data/mockData';
import { generateId } from '../utils/helpers';
import * as chatService from '../services/chatService';

interface ChatStore {
    messages: Record<string, ChatMessage[]>;
    isLoading: boolean;

    fetchMessages: (eventId: string, type?: 'event' | 'community') => Promise<void>;
    sendMessage: (eventId: string, userId: string, text: string, type?: 'event' | 'community') => Promise<void>;
    addSystemMessage: (eventId: string, text: string) => void;
    subscribeToRoom: (eventId: string, type?: 'event' | 'community') => () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    messages: { '1': MOCK_MESSAGES },
    isLoading: false,

    fetchMessages: async (eventId: string, type: 'event' | 'community' = 'event') => {
        set({ isLoading: true });
        const data = await chatService.fetchMessages(eventId, type);
        set((state) => ({
            messages: {
                ...state.messages,
                [eventId]: data.length > 0 ? data : (state.messages[eventId] || []),
            },
            isLoading: false,
        }));
    },

    sendMessage: async (eventId: string, userId: string, text: string, type: 'event' | 'community' = 'event') => {
        // Optimistic update
        const user = MOCK_USERS.find((u) => u.id === userId) || MOCK_USERS[0];
        const optimistic: ChatMessage = {
            id: generateId(),
            eventId,
            userId,
            user,
            text,
            timestamp: new Date().toISOString(),
            isSystem: false,
        };
        set((state) => ({
            messages: {
                ...state.messages,
                [eventId]: [...(state.messages[eventId] || []), optimistic],
            },
        }));

        // Persist to Supabase (silent fail — optimistic message stays)
        await chatService.sendMessage(eventId, userId, text, false, type);
    },

    addSystemMessage: (eventId: string, text: string) => {
        const systemMessage: ChatMessage = {
            id: generateId(),
            eventId,
            userId: 'system',
            user: MOCK_USERS[0],
            text,
            timestamp: new Date().toISOString(),
            isSystem: true,
        };
        set((state) => ({
            messages: {
                ...state.messages,
                [eventId]: [...(state.messages[eventId] || []), systemMessage],
            },
        }));
    },

    subscribeToRoom: (eventId: string, type: 'event' | 'community' = 'event') => {
        return chatService.subscribeToMessages(eventId, (msg) => {
            set((state) => {
                const existing = state.messages[eventId] || [];
                // Avoid duplicates (realtime may echo our own sends)
                if (existing.some((m) => m.id === msg.id)) return state;
                return {
                    messages: { ...state.messages, [eventId]: [...existing, msg] },
                };
            });
        }, type);
    },
}));
