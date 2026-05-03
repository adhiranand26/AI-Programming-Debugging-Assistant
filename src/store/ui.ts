import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface UIState {
  commandPaletteOpen: boolean;
  notifications: Notification[];
  activeModal: string | null;
  setCommandPaletteOpen: (open: boolean) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  setActiveModal: (modal: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  commandPaletteOpen: false,
  notifications: [],
  activeModal: null,
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  addNotification: (notification) => set((state) => ({ notifications: [...state.notifications, notification] })),
  removeNotification: (id) => set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) })),
  setActiveModal: (activeModal) => set({ activeModal }),
}));
