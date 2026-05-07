import React from 'react';
import { useEditorStore, useUIStore, useLayoutStore, useTerminalStore } from '../../store';
import { Play, Sparkles, Save } from 'lucide-react';
import { saveActiveFile } from '../../utils/fileOperations';

export const TitleBar: React.FC = () => {
  const openFiles = useEditorStore(state => state.openFiles);
  const activeFileId = useEditorStore(state => state.activeFileId);
  const setCommandPaletteOpen = useUIStore(state => state.setCommandPaletteOpen);
  const setTerminalOpen = useLayoutStore(state => state.setTerminalOpen);
  const setPendingCommand = useTerminalStore(state => state.setPendingCommand);
  
  const activeFile = openFiles.find(f => f.id === activeFileId) || (openFiles.length > 0 ? openFiles[0] : null);
  const breadcrumbs = activeFile ? activeFile.path.split('/').filter(Boolean) : [];

  const handleRun = () => {
    if (!activeFile) return;

    let command = '';
    const language = (activeFile.language || 'plaintext').toLowerCase();
    const isUntitled = activeFile.name === 'Untitled';
    
    // For untitled/unsaved files, we pipe the content to the interpreter
    if (isUntitled) {
      const escapedContent = activeFile.content.replace(/'/g, "'\\''"); // Escape single quotes for bash
      
      switch (language) {
        case 'python':
          command = `python3 -c '${escapedContent}'`;
          break;
        case 'javascript':
          command = `node -e '${escapedContent}'`;
          break;
        case 'typescript':
          command = `npx ts-node -e '${escapedContent}'`;
          break;
        case 'shell':
        case 'sh':
        case 'bash':
          command = `bash -c '${escapedContent}'`;
          break;
        default:
          command = `echo "Save the file to run it with a custom interpreter."`;
      }
    } else {
      const path = activeFile.path;
      const ext = activeFile.name.split('.').pop()?.toLowerCase();
      
      switch (language) {
        case 'python': command = `python3 ${path}`; break;
        case 'javascript': command = `node ${path}`; break;
        case 'typescript': command = `npx ts-node ${path}`; break;
        case 'go': command = `go run ${path}`; break;
        case 'rust': command = `cargo run`; break;
        case 'shell':
        case 'sh':
        case 'bash': command = `bash ${path}`; break;
        case 'cpp': command = `g++ ${path} -o /tmp/out && /tmp/out`; break;
        default:
          if (ext === 'py') command = `python3 ${path}`;
          else if (ext === 'js') command = `node ${path}`;
          else command = `echo "No default runner for ${activeFile.name}"`;
      }
    }

    setTerminalOpen(true);
    setPendingCommand(command);
  };

  return (
    <div className="h-[44px] w-full flex items-center justify-between px-4 bg-panel border-b border-default z-[100] flex-shrink-0 backdrop-blur-xl bg-panel/80">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-1">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-black/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e] border border-black/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840] border border-black/10" />
        </div>
        <div className="flex items-center gap-2 group cursor-default select-none">
          <Sparkles size={16} className="text-accent-violet group-hover:rotate-12 transition-transform duration-500" />
          <span className="font-ui text-[13px] font-bold text-primary tracking-tight">
            NEXUS <span className="text-accent-violet">AI</span>
          </span>
        </div>
      </div>

      <div className="flex-1 flex justify-center overflow-hidden">
        <div className="flex items-center gap-2 text-[12px] font-ui text-muted max-w-full">
          {breadcrumbs.length > 0 ? (
            breadcrumbs.map((segment, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-[10px] opacity-30 select-none">/</span>}
                <span className={`
                  px-1.5 py-0.5 rounded-md transition-all duration-200 truncate max-w-[150px]
                  ${index === breadcrumbs.length - 1 
                    ? 'text-primary font-medium bg-active border border-strong' 
                    : 'hover:text-secondary hover:bg-surface cursor-pointer'}
                `}>
                  {segment}
                </span>
              </React.Fragment>
            ))
          ) : (
            <span className="text-[11px] uppercase tracking-[0.2em] opacity-30 font-bold">Workspace</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {activeFile && (
          <>
            <button 
              onClick={saveActiveFile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-all active:scale-95 btn-press shadow-sm"
              title="Save File (Ctrl+S)"
            >
              <Save size={14} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Save</span>
            </button>
            <button 
              onClick={handleRun}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all active:scale-95 btn-press shadow-sm"
            >
              <Play size={14} fill="currentColor" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Run</span>
            </button>
          </>
        )}
        
        <div 
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-3 pl-3 pr-2 py-1.5 bg-surface border border-default rounded-xl cursor-pointer hover:border-accent-violet/30 hover:bg-active transition-all duration-300 group shadow-sm"
        >
          <span className="text-[11px] font-medium text-muted group-hover:text-secondary whitespace-nowrap">Quick Action</span>
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-panel border border-default rounded-lg text-[10px] font-mono text-muted uppercase">
            <span className="text-[9px]">⌘</span>K
          </div>
        </div>
      </div>
    </div>
  );
};
