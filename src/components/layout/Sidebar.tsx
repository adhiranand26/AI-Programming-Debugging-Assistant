import React, { useState, useEffect } from 'react';
import { useLayoutStore, useWorkspaceStore, useEditorStore } from '../../store';
import { FolderOpen, Search, GitBranch, ChevronRight, ChevronDown, File, RefreshCw, FolderPlus, FilePlus } from 'lucide-react';
import { readFileContent, createNewFile, createNewDirectory } from '../../services/fileSystem';
import type { FileNode } from '../../services/fileSystem';

const TAB_LABELS: Record<string, string> = {
  files: 'Explorer',
  search: 'Search',
  git: 'Source Control',
  outline: 'Outline',
};

const FileTreeItem: React.FC<{ node: FileNode; level?: number }> = ({ node, level = 0 }) => {
  const { toggleFolder } = useWorkspaceStore();
  const { openFile } = useEditorStore();
  const isDir = node.kind === 'directory';

  const handleClick = async () => {
    if (isDir) {
      await toggleFolder(node.path);
    } else {
      try {
        const content = await readFileContent(node.handle as any);
        openFile({
          id: node.path,
          name: node.name,
          path: node.path,
          content,
          language: node.name.split('.').pop() || 'plaintext',
          fileHandle: node.handle
        });
      } catch (err) {
        console.error("Failed to read file", err);
      }
    }
  };

  return (
    <div>
      <div 
        onClick={handleClick}
        className="flex items-center gap-1.5 px-2 py-1 hover:bg-overlay/50 cursor-pointer text-primary transition-colors group"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <span className="text-muted/70 group-hover:text-muted transition-colors">
          {isDir ? (
            node.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <File size={13} className="ml-0.5 opacity-80" />
          )}
        </span>
        <span className="text-[12px] truncate select-none">{node.name}</span>
      </div>
      {isDir && node.isExpanded && node.children && (
        <div className="flex flex-col">
          {node.children.map((child, idx) => (
            <FileTreeItem key={`${child.path}-${idx}`} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { sidebarWidth, activeSidebarTab } = useLayoutStore();
  const { handle, files, isLoading, initialize, openWorkspace, refreshFiles } = useWorkspaceStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initialize();
  }, []);

  return (
    <div 
      style={{ width: `${sidebarWidth}px` }} 
      className="h-full bg-surface flex-shrink-0 flex flex-col border-r border-default"
    >
      {/* Header */}
      <div className="h-[52px] flex flex-col justify-center px-4 border-b border-default bg-panel/30 backdrop-blur-sm shrink-0">
        <div className="flex items-center justify-between">
          <span className="font-ui text-[11px] font-bold text-muted uppercase tracking-[0.25em]">
            {TAB_LABELS[activeSidebarTab] || activeSidebarTab}
          </span>
          {activeSidebarTab === 'files' && handle && (
            <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
              <button className="p-1 text-muted hover:text-primary transition-colors" title="New File" onClick={async () => {
                const name = prompt("Enter file name:");
                if (name && handle) {
                  await createNewFile(handle, name);
                  refreshFiles();
                }
              }}>
                <FilePlus size={14} />
              </button>
              <button className="p-1 text-muted hover:text-primary transition-colors" title="New Folder" onClick={async () => {
                const name = prompt("Enter folder name:");
                if (name && handle) {
                  await createNewDirectory(handle, name);
                  refreshFiles();
                }
              }}>
                <FolderPlus size={14} />
              </button>
              <button className="p-1 text-muted hover:text-primary transition-colors" title="Refresh" onClick={refreshFiles}>
                <RefreshCw size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-1 py-2 scrollable-hover">
        {activeSidebarTab === 'files' && (
          <>
            {!handle ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-6 animate-[fadeSlideUp_0.4s_ease-out]">
                <div className="w-12 h-12 rounded-2xl bg-base border border-subtle flex items-center justify-center text-muted/30">
                  <FolderOpen size={24} />
                </div>
                <div className="space-y-1.5">
                  <span className="block text-[13px] font-semibold text-primary">Explorer is empty</span>
                  <span className="block text-[11px] text-muted leading-relaxed">Open a folder to start building with Nexus AI.</span>
                </div>
                <button 
                  onClick={openWorkspace}
                  className="mt-2 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-accent-violet border border-accent-violet/30 rounded-xl hover:bg-accent-violet/10 transition-all btn-press shadow-sm"
                >
                  Open Workspace
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="px-2 py-1 mb-2">
                  <span className="text-[10px] font-bold text-muted/60 uppercase tracking-widest truncate block">
                    {handle.name}
                  </span>
                </div>
                {isLoading && files.length === 0 ? (
                  <div className="px-4 py-2 text-[11px] text-muted">Loading workspace...</div>
                ) : (
                  files.map((node, idx) => (
                    <FileTreeItem key={`${node.path}-${idx}`} node={node} />
                  ))
                )}
              </div>
            )}
          </>
        )}

        {activeSidebarTab === 'search' && (
          <div className="flex flex-col gap-4 animate-[fadeSlideUp_0.4s_ease-out] px-2">
            <div className="relative group">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Global Search"
                className="w-full bg-base border border-default rounded-xl px-4 py-2.5 text-[12px] text-primary placeholder-muted outline-none focus:border-accent-violet/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.05)] transition-all"
              />
              <Search size={14} className="absolute right-4 top-3 text-muted group-focus-within:text-accent-violet transition-colors" />
            </div>
            <div className="flex flex-col items-center justify-center gap-4 text-center pt-12 opacity-40">
              <Search size={24} className="text-muted" />
              <span className="text-[11px] font-medium text-muted">
                {searchQuery ? `No matches found` : 'Search across all files'}
              </span>
            </div>
          </div>
        )}

        {activeSidebarTab === 'git' && (
          <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-6 animate-[fadeSlideUp_0.4s_ease-out]">
            <div className="w-12 h-12 rounded-2xl bg-base border border-subtle flex items-center justify-center text-muted/30">
              <GitBranch size={24} />
            </div>
            <div className="space-y-1.5">
              <span className="block text-[13px] font-semibold text-primary">No Source Control</span>
              <span className="block text-[11px] text-muted leading-relaxed">Initialize a git repository to track your changes.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


