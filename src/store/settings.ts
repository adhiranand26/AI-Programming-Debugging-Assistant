import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIProvider {
  id: string;
  type: 'ollama' | 'openai' | 'anthropic' | 'google' | 'openrouter' | 'custom' | 'inception';
  name: string;
  baseUrl?: string;
  apiKey?: string;
  defaultModel?: string;
}

interface SettingsState {
  theme: string;
  uiFont: string;
  editorFont: string;
  uiFontSize: number;
  editorFontSize: number;
  editorLineHeight: number;
  density: 'compact' | 'default' | 'comfortable';
  accentHue: number;
  keybindingProfile: 'default' | 'vscode' | 'vim' | 'emacs';
  customKeybindings: string;
  
  formatOnSave: boolean;
  wordWrap: boolean;
  minimap: boolean;
  ligatures: boolean;
  cursorStyle: 'line' | 'block' | 'underline';
  cursorBlink: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
  indentGuides: boolean;
  tabSize: number;

  providers: AIProvider[];
  activeProviderId: string | null;
  ollamaBaseUrl: string;
  
  aiTemperature: number;
  aiTopP: number;
  aiRepeatPenalty: number;
  aiContextLength: number;
  fileTypeSystemPrompts: Record<string, string>;

  setTheme: (theme: string) => void;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  addProvider: (provider: AIProvider) => void;
  updateProvider: (id: string, provider: Partial<AIProvider>) => void;
  deleteProvider: (id: string) => void;
  setActiveProvider: (id: string | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'sovereign',
      uiFont: 'Space Grotesk',
      editorFont: 'JetBrains Mono',
      uiFontSize: 13,
      editorFontSize: 14,
      editorLineHeight: 1.8,
      density: 'default',
      accentHue: 245,
      keybindingProfile: 'default',
      customKeybindings: '{\n  "bindings": []\n}',
      
      formatOnSave: true,
      wordWrap: false,
      minimap: true,
      ligatures: true,
      cursorStyle: 'line',
      cursorBlink: 'smooth',
      indentGuides: true,
      tabSize: 2,

      ollamaBaseUrl: 'http://localhost:11434',
      providers: [
        {
          id: 'inception',
          type: 'inception',
          name: 'Inception AI',
          baseUrl: 'https://api.inceptionlabs.ai/v1',
          apiKey: (import.meta.env.VITE_INCEPTION_API_KEY as string) || '',
          defaultModel: 'mercury-2'
        },
        {
          id: 'ollama',
          type: 'ollama',
          name: 'Ollama (Local)',
          baseUrl: 'http://localhost:11434',
          defaultModel: 'llama3'
        }
      ],
      activeProviderId: 'inception',
      
      aiTemperature: 0.7,
      aiTopP: 0.9,
      aiRepeatPenalty: 1.1,
      aiContextLength: 8192,
      fileTypeSystemPrompts: {},

      setTheme: (theme) => set({ theme }),
      updateSetting: (key, value) => set({ [key]: value }),
      addProvider: (provider) => set((state) => ({ providers: [...state.providers, provider] })),
      updateProvider: (id, updates) => set((state) => ({
        providers: state.providers.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProvider: (id) => set((state) => ({
        providers: state.providers.filter(p => p.id !== id),
        activeProviderId: state.activeProviderId === id ? null : state.activeProviderId
      })),
      setActiveProvider: (id) => set({ activeProviderId: id }),
    }),
    { 
      name: 'nexus-settings-storage',
      merge: (persistedState: any, currentState: SettingsState) => {
        const merged = { ...currentState, ...persistedState };
        if (!merged.providers?.find((p: any) => p.id === 'inception')) {
          merged.providers = [
            ...(merged.providers || []),
            {
              id: 'inception',
              type: 'inception',
              name: 'Inception AI',
              baseUrl: 'https://api.inceptionlabs.ai/v1',
              apiKey: (import.meta.env.VITE_INCEPTION_API_KEY as string) || '',
              defaultModel: 'mercury-2'
            }
          ];
          if (!merged.activeProviderId) {
            merged.activeProviderId = 'inception';
          }
        }
        return merged;
      }
    }
  )
);
