import { useEditorStore, useWorkspaceStore } from '../store';
import { writeFileContent, saveNewFile } from '../services/fileSystem';

export const saveActiveFile = async () => {
  const { activeFileId, openFiles } = useEditorStore.getState();
  const activeFile = openFiles.find(f => f.id === activeFileId);
  const { handle: workspaceHandle, refreshFiles } = useWorkspaceStore.getState();

  if (!activeFileId || !activeFile) return;
  
  try {
    if (activeFile.fileHandle) {
      // File exists, write directly
      await writeFileContent(activeFile.fileHandle, activeFile.content);
      useEditorStore.getState().saveFile(activeFile.id);
    } else {
      // No file handle, prompt for save location
      const handle = await saveNewFile();
      if (handle) {
        await writeFileContent(handle, activeFile.content);
        // Update the store with new handle and name
        const state = useEditorStore.getState();
        const newFiles = state.openFiles.map(f => {
          if (f.id === activeFile.id) {
            return { 
              ...f, 
              id: handle.name,
              name: handle.name, 
              path: handle.name, 
              fileHandle: handle,
              savedContent: f.content,
              isDirty: false
            };
          }
          return f;
        });
        
        useEditorStore.setState({
          openFiles: newFiles,
          unsavedFileIds: state.unsavedFileIds.filter(id => id !== activeFile.id),
          activeFileId: handle.name
        });
        
        if (workspaceHandle) {
          refreshFiles();
        }
      }
    }
  } catch (err) {
    console.error("Failed to save file", err);
  }
};
