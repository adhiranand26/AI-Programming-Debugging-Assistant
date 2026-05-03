import { create } from 'zustand';
import { 
  getSavedWorkspace, 
  openWorkspaceDirectory, 
  readDirectoryRecursively 
} from '../services/fileSystem';
import type { FileNode } from '../services/fileSystem';

interface WorkspaceState {
  handle: FileSystemDirectoryHandle | null;
  files: FileNode[];
  isLoading: boolean;
  
  initialize: () => Promise<void>;
  openWorkspace: () => Promise<void>;
  refreshFiles: () => Promise<void>;
  toggleFolder: (path: string) => Promise<void>;
}

const toggleNode = (nodes: FileNode[], path: string, childrenToSet?: FileNode[]): FileNode[] => {
  return nodes.map(node => {
    if (node.path === path && node.kind === 'directory') {
      return { 
        ...node, 
        isExpanded: !node.isExpanded,
        children: childrenToSet !== undefined ? childrenToSet : node.children 
      };
    }
    if (node.children) {
      return { ...node, children: toggleNode(node.children, path, childrenToSet) };
    }
    return node;
  });
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  handle: null,
  files: [],
  isLoading: true,

  initialize: async () => {
    set({ isLoading: true });
    const handle = await getSavedWorkspace();
    if (handle) {
      const files = await readDirectoryRecursively(handle);
      set({ handle, files, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  openWorkspace: async () => {
    const handle = await openWorkspaceDirectory();
    if (handle) {
      set({ isLoading: true });
      const files = await readDirectoryRecursively(handle);
      set({ handle, files, isLoading: false });
    }
  },

  refreshFiles: async () => {
    const { handle } = get();
    if (handle) {
      // In a more robust implementation, we'd preserve the expanded state of directories
      // For simplicity now, we just reload the root
      const files = await readDirectoryRecursively(handle);
      set({ files });
    }
  },

  toggleFolder: async (path: string) => {
    const { files, handle } = get();
    if (!handle) return;
    
    // We need to find the node to see if it's already loaded
    let foundNode: FileNode | null = null;
    const findNode = (nodes: FileNode[]) => {
      for (const node of nodes) {
        if (node.path === path) foundNode = node;
        if (node.children) findNode(node.children);
      }
    };
    findNode(files);

    const targetNode = foundNode as FileNode | null;

    if (targetNode && targetNode.kind === 'directory' && !targetNode.isExpanded && (!targetNode.children || targetNode.children.length === 0)) {
      // Load children if not already loaded
      const children = await readDirectoryRecursively(targetNode.handle as FileSystemDirectoryHandle, targetNode.path);
      set({ files: toggleNode(files, path, children) });
    } else {
      // Just toggle
      set({ files: toggleNode(files, path) });
    }
  }
}));
