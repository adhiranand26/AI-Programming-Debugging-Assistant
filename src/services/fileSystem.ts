import { get, set } from 'idb-keyval';

export const FOLDER_HANDLE_KEY = 'nexus-workspace-handle';

// File System Handle Definitions (for TS)
export interface FileNode {
  name: string;
  path: string;
  kind: 'file' | 'directory';
  handle: FileSystemHandle;
  children?: FileNode[];
  isExpanded?: boolean;
}

export async function verifyPermission(fileHandle: FileSystemHandle, readWrite = false) {
  const options = { mode: readWrite ? 'readwrite' : 'read' } as any;
  // Check if permission was already granted.
  if ((await (fileHandle as any).queryPermission(options)) === 'granted') {
    return true;
  }
  // Request permission.
  if ((await (fileHandle as any).requestPermission(options)) === 'granted') {
    return true;
  }
  return false;
}

export const getSavedWorkspace = async (): Promise<FileSystemDirectoryHandle | null> => {
  try {
    const handle = await get<FileSystemDirectoryHandle>(FOLDER_HANDLE_KEY);
    if (handle) {
      const hasPermission = await verifyPermission(handle, true);
      if (hasPermission) return handle;
    }
  } catch (err) {
    console.error('Failed to get saved workspace', err);
  }
  return null;
};

export const saveWorkspaceHandle = async (handle: FileSystemDirectoryHandle) => {
  await set(FOLDER_HANDLE_KEY, handle);
};

export const openWorkspaceDirectory = async (): Promise<FileSystemDirectoryHandle | null> => {
  try {
    const handle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
    });
    await saveWorkspaceHandle(handle);
    return handle;
  } catch (err) {
    console.error('User cancelled or failed to open directory', err);
    return null;
  }
};

export const readDirectoryRecursively = async (
  dirHandle: FileSystemDirectoryHandle,
  path = ''
): Promise<FileNode[]> => {
  const entries: FileNode[] = [];
  for await (const entry of (dirHandle as any).values()) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue; // Simple ignore rules
    const entryPath = path ? `${path}/${entry.name}` : entry.name;
    
    if (entry.kind === 'directory') {
      entries.push({
        name: entry.name,
        path: entryPath,
        kind: 'directory',
        handle: entry,
        children: [], // We don't read recursively all the way down for performance, just 1 level or lazy load
        isExpanded: false
      });
    } else {
      entries.push({
        name: entry.name,
        path: entryPath,
        kind: 'file',
        handle: entry
      });
    }
  }
  // Sort directories first, then files alphabetically
  return entries.sort((a, b) => {
    if (a.kind === b.kind) return a.name.localeCompare(b.name);
    return a.kind === 'directory' ? -1 : 1;
  });
};

export const readFileContent = async (fileHandle: FileSystemFileHandle): Promise<string> => {
  const file = await fileHandle.getFile();
  return await file.text();
};

export const writeFileContent = async (fileHandle: FileSystemFileHandle, contents: string): Promise<void> => {
  const writable = await (fileHandle as any).createWritable();
  await writable.write(contents);
  await writable.close();
};

export const createNewFile = async (dirHandle: FileSystemDirectoryHandle, name: string): Promise<FileSystemFileHandle> => {
  return await dirHandle.getFileHandle(name, { create: true });
};

export const createNewDirectory = async (dirHandle: FileSystemDirectoryHandle, name: string): Promise<FileSystemDirectoryHandle> => {
  return await dirHandle.getDirectoryHandle(name, { create: true });
};

export const saveNewFile = async (): Promise<FileSystemFileHandle | null> => {
  try {
    const handle = await (window as any).showSaveFilePicker();
    return handle;
  } catch (err) {
    console.error('User cancelled save', err);
    return null;
  }
};
