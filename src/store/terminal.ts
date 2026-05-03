import { create } from 'zustand';

export interface TerminalTab {
  id: string;
  title: string;
}

interface TerminalState {
  terminals: TerminalTab[];
  activeTerminalId: string | null;
  pendingCommand: string | null;
  addTerminal: (title?: string) => void;
  closeTerminal: (id: string) => void;
  setActiveTerminalId: (id: string | null) => void;
  setPendingCommand: (command: string | null) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  terminals: [{ id: 'term-1', title: 'zsh' }],
  activeTerminalId: 'term-1',
  pendingCommand: null,
  addTerminal: (title = 'zsh') => set((state) => {
    const id = `term-${Date.now()}`;
    return {
      terminals: [...state.terminals, { id, title }],
      activeTerminalId: id
    };
  }),
  closeTerminal: (id) => set((state) => {
    const newTerminals = state.terminals.filter(t => t.id !== id);
    const newActiveId = state.activeTerminalId === id 
      ? (newTerminals.length > 0 ? newTerminals[newTerminals.length - 1].id : null)
      : state.activeTerminalId;
    return {
      terminals: newTerminals,
      activeTerminalId: newActiveId
    };
  }),
  setActiveTerminalId: (id) => set({ activeTerminalId: id }),
  setPendingCommand: (command) => set({ pendingCommand: command }),
}));
