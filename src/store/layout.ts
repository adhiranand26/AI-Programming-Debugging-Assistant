import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  sidebarWidth: number;
  aiPanelWidth: number;
  terminalHeight: number;
  terminalOpen: boolean;
  activeSidebarTab: 'files' | 'search' | 'git' | 'outline';
  activeLayoutProfile: string;
  setSidebarWidth: (width: number) => void;
  setAIPanelWidth: (width: number) => void;
  setTerminalHeight: (height: number) => void;
  setTerminalOpen: (open: boolean) => void;
  setActiveSidebarTab: (tab: 'files' | 'search' | 'git' | 'outline') => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      sidebarWidth: 220,
      aiPanelWidth: 280,
      terminalHeight: 200,
      terminalOpen: false,
      activeSidebarTab: 'files',
      activeLayoutProfile: 'coding',
      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
      setAIPanelWidth: (aiPanelWidth) => set({ aiPanelWidth }),
      setTerminalHeight: (terminalHeight) => set({ terminalHeight }),
      setTerminalOpen: (terminalOpen) => set({ terminalOpen }),
      setActiveSidebarTab: (activeSidebarTab) => set({ activeSidebarTab }),
    }),
    { name: 'nexus-layout-storage' }
  )
);
