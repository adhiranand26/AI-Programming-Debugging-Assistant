import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIState {
  messages: AIMessage[];
  isStreaming: boolean;
  mode: 'chat' | 'code';
  pinnedFiles: string[];
  activeModel: string;
  models: string[];
  isOllamaConnected: boolean;
  contextWindowUsage: number;
  streamMetrics: { startTime: number, tokens: number } | null;
  addMessage: (msg: AIMessage) => void;
  updateMessage: (id: string, contentUpdater: (prev: string) => string) => void;
  clearMessages: () => void;
  setStreaming: (isStreaming: boolean) => void;
  setMode: (mode: 'chat' | 'code') => void;
  setActiveModel: (model: string) => void;
  setModels: (models: string[]) => void;
  setOllamaConnected: (connected: boolean) => void;
  setContextWindowUsage: (usage: number) => void;
  setStreamMetrics: (metrics: { startTime: number, tokens: number } | null) => void;
  incrementStreamTokens: () => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      messages: [],
      isStreaming: false,
      mode: 'chat',
      pinnedFiles: [],
      activeModel: 'llama3',
      models: [],
      isOllamaConnected: false,
      contextWindowUsage: 0,
      streamMetrics: null,
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      updateMessage: (id, contentUpdater) => set((state) => ({
        messages: state.messages.map(msg => 
          msg.id === id ? { ...msg, content: contentUpdater(msg.content) } : msg
        )
      })),
      clearMessages: () => set({ messages: [] }),
      setStreaming: (isStreaming) => set(() => {
        if (isStreaming) {
          return { isStreaming, streamMetrics: { startTime: Date.now(), tokens: 0 } };
        }
        return { isStreaming };
      }),
      setMode: (mode) => set({ mode }),
      setActiveModel: (activeModel) => set({ activeModel }),
      setModels: (models) => set({ models }),
      setOllamaConnected: (isOllamaConnected) => set({ isOllamaConnected }),
      setContextWindowUsage: (contextWindowUsage) => set({ contextWindowUsage }),
      setStreamMetrics: (streamMetrics) => set({ streamMetrics }),
      incrementStreamTokens: () => set((state) => ({
        streamMetrics: state.streamMetrics 
          ? { ...state.streamMetrics, tokens: state.streamMetrics.tokens + 1 }
          : null
      })),
    }),
    { name: 'nexus-ai-storage' }
  )
);
