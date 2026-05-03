import React from 'react';
import { GitBranch, XCircle, AlertTriangle } from 'lucide-react';
import { useLayoutStore, useAIStore, useEditorStore } from '../../store';

export const StatusBar: React.FC = () => {
  const { setTerminalOpen, terminalOpen } = useLayoutStore();
  const { activeModel, isOllamaConnected } = useAIStore();
  const { openFiles, activeFileId } = useEditorStore();
  const activeFile = openFiles.find(f => f.id === activeFileId);

  return (
    <div className="h-[28px] w-full bg-panel border-t border-default flex items-center justify-between px-4 fixed bottom-0 z-[100] text-[11px] font-mono text-muted flex-shrink-0 select-none shadow-[0_-4px_24px_rgba(0,0,0,0.2)]">
      {/* Left */}
      <div className="flex items-center h-full gap-5">
        <div className="flex items-center gap-2 hover:text-secondary cursor-pointer transition-colors duration-200 h-full px-1 group">
          <GitBranch size={13} className="text-muted group-hover:text-accent-violet transition-colors" />
          <span className="font-bold">main</span>
        </div>
        
        <div 
          className="flex items-center gap-4 hover:text-secondary cursor-pointer transition-colors duration-200 h-full px-1"
          onClick={() => setTerminalOpen(!terminalOpen)}
        >
          <div className="flex items-center gap-1.5">
            <XCircle size={13} className="text-error/70" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-warning/70" />
            <span>0</span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center h-full gap-6">
        <div className="flex items-center gap-4">
          <div className="hover:text-primary cursor-default transition-colors">Ln 1, Col 1</div>
          <div className="hover:text-primary cursor-default transition-colors">UTF-8</div>
          <div className="hover:text-primary cursor-default transition-colors uppercase tracking-widest text-[9px] font-bold">
            {activeFile?.language || 'Plain Text'}
          </div>
        </div>

        <div className="w-[1px] h-3 bg-default" />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 hover:text-secondary cursor-pointer transition-colors px-1 group">
            <span className="text-[10px] font-bold tracking-tighter opacity-50 group-hover:opacity-100 uppercase">Model</span>
            <span className="text-primary font-bold">{activeModel || 'None'}</span>
            <div className={`w-2 h-2 rounded-full ${isOllamaConnected ? 'bg-accent-cyan shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-warning animate-pulse'} ml-0.5`} />
          </div>
        </div>
      </div>
    </div>
  );
};
