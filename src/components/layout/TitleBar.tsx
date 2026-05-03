import React from 'react';
import { useEditorStore, useUIStore, useLayoutStore, useTerminalStore } from '../../store';
import { Play, Sparkles } from 'lucide-react';

export const TitleBar: React.FC = () => {
  const { openFiles, activeFileId } = useEditorStore();
  const { setCommandPaletteOpen } = useUIStore();
  const { setTerminalOpen } = useLayoutStore();
  const { setPendingCommand } = useTerminalStore();
  
  const activeFile = openFiles.find(f => f.id === activeFileId);
  
  // Format breadcrumbs from path
  const breadcrumbs = activeFile ? activeFile.path.split('/').filter(Boolean) : [];

  const handleRun = () => {
    if (!activeFile) return;

    let command = '';
    const ext = activeFile.name.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'py': command = `python3 ${activeFile.path}`; break;
      case 'js': command = `node ${activeFile.path}`; break;
      case 'ts': command = `npx ts-node ${activeFile.path}`; break;
      case 'go': command = `go run ${activeFile.path}`; break;
      case 'rs': command = `cargo run`; break;
      case 'sh': command = `bash ${activeFile.path}`; break;
      default: command = `echo "No default runner configured for .${ext}"`;
    }

    setTerminalOpen(true);
    setPendingCommand(command);
  };

  return (
    <div className="h-[44px] w-full flex items-center justify-between px-4 bg-panel border-b border-default z-[100] flex-shrink-0 backdrop-blur-xl bg-panel/80">
      {/* Left */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-1">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-black/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e] border border-black/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840] border border-black/10" />
        </div>
        <div className="flex items-center gap-2 group cursor-default">
          <Sparkles size={16} className="text-accent-violet group-hover:rotate-12 transition-transform duration-500" />
          <span className="font-ui text-[13px] font-bold text-primary tracking-tight">
            NEXUS <span className="text-accent-violet">AI</span>
          </span>
        </div>
      </div>

      {/* Center Breadcrumbs */}
      <div className="flex items-center gap-2 text-[12px] font-ui text-muted">
        {breadcrumbs.length > 0 ? (
          breadcrumbs.map((segment, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-[10px] opacity-30 select-none">/</span>}
              <span className={`
                px-1.5 py-0.5 rounded-md transition-all duration-200 cursor-pointer
                ${index === breadcrumbs.length - 1 
                  ? 'text-primary font-medium bg-active border border-strong' 
                  : 'hover:text-secondary hover:bg-surface'}
              `}>
                {segment}
              </span>
            </React.Fragment>
          ))
        ) : (
          <span className="text-[11px] uppercase tracking-[0.2em] opacity-30 font-bold">Workspace</span>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {activeFile && (
          <button 
            onClick={handleRun}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all active:scale-95 btn-press shadow-sm"
            title="Run Current File"
          >
            <Play size={14} fill="currentColor" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Run</span>
          </button>
        )}
        <div 
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-3 pl-3 pr-2 py-1.5 bg-surface border border-default rounded-xl cursor-pointer hover:border-accent-violet/30 hover:bg-active transition-all duration-300 group shadow-sm"
        >
          <span className="text-[11px] font-medium text-muted group-hover:text-secondary">Quick Action</span>
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-panel border border-default rounded-lg text-[10px] font-mono text-muted uppercase">
            <span className="text-[9px]">⌘</span>K
          </div>
        </div>
      </div>
    </div>
  );
};
