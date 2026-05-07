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
  setLanguage: (id: string, language: string) => void;
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
            let language = f.language;

            // Simple language detection for untitled files
            if (f.name === 'Untitled' && (f.language === 'plaintext' || !f.language)) {
              const lower = content.toLowerCase();
              if (content.includes('print(') || content.includes('def ')) language = 'python';
              else if (content.includes('function') || content.includes('const ') || content.includes('console.log')) language = 'javascript';
              else if (content.includes('import React') || content.includes('export const')) language = 'typescript';
              else if (content.includes('<html>') || content.includes('<div>')) language = 'html';
              else if (content.includes('package main') || content.includes('func main')) language = 'go';
              else if (lower.includes('#include') || lower.includes('int main')) language = 'cpp';
            }

            return { ...f, content, isDirty, language };
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
      setLanguage: (id, language) => set((state) => ({
        openFiles: state.openFiles.map(f => f.id === id ? { ...f, language } : f)
      })),
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
