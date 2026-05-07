import React, { useState, useEffect, useRef } from 'react';
import { useLayoutStore, useWorkspaceStore, useEditorStore } from '../../store';
import { 
  FolderOpen, Search, GitBranch, ChevronRight, ChevronDown, 
  File, RefreshCw, FolderPlus, FilePlus, X, Check,
  Code2, FileCode, FileJson, FileType, FileText, Image, Terminal,
  Layers, Braces, Hash, Globe, Coffee, Palette
} from 'lucide-react';
import { readFileContent, createNewFile, createNewDirectory } from '../../services/fileSystem';
import type { FileNode } from '../../services/fileSystem';

const TAB_LABELS: Record<string, string> = {
  files: 'Explorer',
  search: 'Search',
  git: 'Source Control',
  outline: 'Outline',
};

const FileIcon: React.FC<{ name: string; size?: number; className?: string }> = ({ name, size = 14, className = "" }) => {
  const ext = name.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'js':
    case 'jsx':
      return <div className="relative"><FileCode size={size} className={`${className} text-[#f7df1e]`} /><div className="absolute inset-0 bg-[#f7df1e]/10 blur-[4px]" /></div>;
    case 'ts':
    case 'tsx':
      return <FileCode size={size} className={`${className} text-[#3178c6]`} />;
    case 'py':
      // Using Braces for Python as it looks more like code logic
      return <div className="relative"><Braces size={size} className={`${className} text-[#3776ab]`} /><div className="absolute -right-0.5 -bottom-0.5 w-1.5 h-1.5 bg-[#ffd343] rounded-full" /></div>;
    case 'html':
      return <Globe size={size} className={`${className} text-[#e34f26]`} />;
    case 'css':
    case 'scss':
      return <Hash size={size} className={`${className} text-[#1572b6]`} />;
    case 'json':
      return <FileJson size={size} className={`${className} text-[#fbc02d]`} />;
    case 'md':
      return <FileText size={size} className={`${className} text-[#61dafb]`} />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'gif':
      return <Image size={size} className={`${className} text-[#da70d6]`} />;
    case 'sh':
    case 'bash':
    case 'zsh':
      return <Terminal size={size} className={`${className} text-[#4caf50]`} />;
    case 'go':
      return <div className="relative"><Layers size={size} className={`${className} text-[#00add8]`} /></div>;
    case 'java':
      return <Coffee size={size} className={`${className} text-[#ed8b00]`} />;
    default:
      return <File size={size} className={`${className} text-muted/40`} />;
  }
};

const FileTreeItem: React.FC<{ node: FileNode; level?: number }> = ({ node, level = 0 }) => {
  const { toggleFolder, handle, refreshFiles } = useWorkspaceStore();
  const { openFile } = useEditorStore();
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isDir = node.kind === 'directory';

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleCreateSubmit = async () => {
    if (!newName) {
      setIsCreating(null);
      return;
    }
    try {
      if (isCreating === 'file') {
        await createNewFile(node.handle as any, newName);
      } else {
        await createNewDirectory(node.handle as any, newName);
      }
      await refreshFiles();
      if (!node.isExpanded) await toggleFolder(node.path);
    } catch (err) {
      alert("Failed to create item.");
    }
    setIsCreating(null);
    setNewName('');
  };

  return (
    <div>
      <div 
        onClick={handleClick}
        className="flex items-center justify-between px-2 py-1 hover:bg-overlay/50 cursor-pointer text-primary transition-colors group"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-muted/70 group-hover:text-muted transition-colors shrink-0">
            {isDir ? (
              node.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            ) : (
              <FileIcon name={node.name} />
            )}
          </span>
          <span className="text-[12px] truncate select-none">{node.name}</span>
        </div>
        
        {isDir && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsCreating('file'); }}
              className="p-1 hover:bg-active rounded text-muted hover:text-primary transition-all"
            >
              <FilePlus size={12} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsCreating('folder'); }}
              className="p-1 hover:bg-active rounded text-muted hover:text-primary transition-all"
            >
              <FolderPlus size={12} />
            </button>
          </div>
        )}
      </div>

      {isCreating && (
        <div className="flex items-center gap-1 px-2 py-1" style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}>
          <div className="w-3.5 flex justify-center">
            {isCreating === 'file' ? <File size={12} className="text-muted" /> : <ChevronRight size={12} className="text-muted" />}
          </div>
          <input 
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateSubmit();
              if (e.key === 'Escape') setIsCreating(null);
            }}
            onBlur={() => { if (!newName) setIsCreating(null); }}
            className="flex-1 bg-active border border-accent-violet/30 rounded px-1.5 py-0.5 text-[11px] outline-none text-primary"
            placeholder={isCreating === 'file' ? "file name..." : "folder name..."}
          />
        </div>
      )}

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
  const [isCreatingRoot, setIsCreatingRoot] = useState<'file' | 'folder' | null>(null);
  const [rootNewName, setRootNewName] = useState('');
  const rootInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isCreatingRoot && rootInputRef.current) {
      rootInputRef.current.focus();
    }
  }, [isCreatingRoot]);

  const handleRootCreateSubmit = async () => {
    if (!rootNewName) {
      setIsCreatingRoot(null);
      return;
    }
    try {
      if (isCreatingRoot === 'file') {
        await createNewFile(handle as any, rootNewName);
      } else {
        await createNewDirectory(handle as any, rootNewName);
      }
      await refreshFiles();
    } catch (err) {
      alert("Failed to create item.");
    }
    setIsCreatingRoot(null);
    setRootNewName('');
  };

  return (
    <div 
      style={{ width: `${sidebarWidth}px` }} 
      className="h-full bg-surface flex-shrink-0 flex flex-col border-r border-default"
    >
      <div className="h-[52px] flex flex-col justify-center px-4 border-b border-default bg-panel/30 backdrop-blur-sm shrink-0">
        <div className="flex items-center justify-between">
          <span className="font-ui text-[11px] font-bold text-muted uppercase tracking-[0.25em]">
            {TAB_LABELS[activeSidebarTab] || activeSidebarTab}
          </span>
          {activeSidebarTab === 'files' && handle && (
            <div className="flex items-center gap-1">
              <button className="p-1 text-muted hover:text-primary transition-colors" title="Switch Workspace" onClick={openWorkspace}>
                <FolderOpen size={14} />
              </button>
              <button className="p-1 text-muted hover:text-primary transition-colors" title="New File" onClick={() => setIsCreatingRoot('file')}>
                <FilePlus size={14} />
              </button>
              <button className="p-1 text-muted hover:text-primary transition-colors" title="New Folder" onClick={() => setIsCreatingRoot('folder')}>
                <FolderPlus size={14} />
              </button>
              <button className="p-1 text-muted hover:text-primary transition-colors" title="Refresh" onClick={refreshFiles}>
                <RefreshCw size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

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

                {isCreatingRoot && (
                  <div className="flex items-center gap-1 px-2 py-1">
                    <div className="w-3.5 flex justify-center">
                      {isCreatingRoot === 'file' ? <File size={12} className="text-muted" /> : <ChevronRight size={12} className="text-muted" />}
                    </div>
                    <input 
                      ref={rootInputRef}
                      type="text"
                      value={rootNewName}
                      onChange={(e) => setRootNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRootCreateSubmit();
                        if (e.key === 'Escape') setIsCreatingRoot(null);
                      }}
                      onBlur={() => { if (!rootNewName) setIsCreatingRoot(null); }}
                      className="flex-1 bg-active border border-accent-violet/30 rounded px-1.5 py-0.5 text-[11px] outline-none text-primary"
                      placeholder={isCreatingRoot === 'file' ? "file name..." : "folder name..."}
                    />
                  </div>
                )}

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
      </div>
    </div>
  );
};
