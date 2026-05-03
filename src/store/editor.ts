import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FileTab {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  savedContent?: string;
  isDirty: boolean;
  isPinned: boolean;
  fileHandle?: any; // FileSystemFileHandle
}

interface DiffState {
  active: boolean;
  originalContent: string;
  modifiedContent: string;
  filename: string;
  fileId: string;
}

interface EditorState {
  openFiles: FileTab[];
  activeFileId: string | null;
  unsavedFileIds: string[];
  activeSelection: string | null;
  diffState: DiffState | null;
  setActiveFileId: (id: string | null) => void;
  setActiveSelection: (selection: string | null) => void;
  setDiffState: (diffState: DiffState | null) => void;
  openFile: (file: Omit<FileTab, 'isDirty' | 'isPinned' | 'language'> & { language?: string }) => void;
  closeFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  saveFile: (id: string) => void;
  discardFileChanges: (id: string) => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      openFiles: [],
      activeFileId: null,
      unsavedFileIds: [],
      activeSelection: null,
      diffState: null,
      setActiveFileId: (activeFileId) => set({ activeFileId }),
      setActiveSelection: (activeSelection) => set({ activeSelection }),
      setDiffState: (diffState) => set({ diffState }),
      openFile: (file) => set((state) => {
        const exists = state.openFiles.find(f => f.id === file.id);
        if (exists) {
          return { activeFileId: file.id };
        }
        
        const newFile: FileTab = {
          ...file,
          language: file.language || 'plaintext',
          savedContent: file.content,
          isDirty: false,
          isPinned: false
        };
        
        return { 
          openFiles: [...state.openFiles, newFile],
          activeFileId: file.id 
        };
      }),
      closeFile: (id) => set((state) => {
        const newFiles = state.openFiles.filter(f => f.id !== id);
        return {
          openFiles: newFiles,
          unsavedFileIds: state.unsavedFileIds.filter(unsavedId => unsavedId !== id),
          activeFileId: state.activeFileId === id 
            ? (newFiles.length > 0 ? newFiles[newFiles.length - 1].id : null)
            : state.activeFileId
        };
      }),
      updateFileContent: (id, content) => set((state) => {
        const newFiles = state.openFiles.map(f => {
          if (f.id === id) {
            const isDirty = f.savedContent !== content;
            return { ...f, content, isDirty };
          }
          return f;
        });
        
        const file = newFiles.find(f => f.id === id);
        let newUnsaved = [...state.unsavedFileIds];
        
        if (file?.isDirty && !newUnsaved.includes(id)) {
          newUnsaved.push(id);
        } else if (!file?.isDirty && newUnsaved.includes(id)) {
          newUnsaved = newUnsaved.filter(uId => uId !== id);
        }
        
        return {
          openFiles: newFiles,
          unsavedFileIds: newUnsaved
        };
      }),
      saveFile: (id) => set((state) => {
        const newFiles = state.openFiles.map(f => {
          if (f.id === id) {
            return { ...f, savedContent: f.content, isDirty: false };
          }
          return f;
        });
        
        return {
          openFiles: newFiles,
          unsavedFileIds: state.unsavedFileIds.filter(uId => uId !== id)
        };
      }),
      discardFileChanges: (id) => set((state) => {
        const newFiles = state.openFiles.map(f => {
          if (f.id === id) {
            return { ...f, content: f.savedContent || '', isDirty: false };
          }
          return f;
        });
        
        return {
          openFiles: newFiles,
          unsavedFileIds: state.unsavedFileIds.filter(uId => uId !== id)
        };
      })
    }),
    { name: 'nexus-editor-storage' }
  )
);
