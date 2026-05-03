import React, { useEffect, useRef } from 'react';
import { useUIStore } from '../../store';
import { Sparkles, FileText, Code, Copy, Scissors, ClipboardPaste } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (actionId: string) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onAction }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    // Listen on capture phase to ensure it runs before other click handlers
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Adjust position to prevent menu from going off-screen
  const menuStyle: React.CSSProperties = {
    top: Math.min(y, window.innerHeight - 300),
    left: Math.min(x, window.innerWidth - 220),
  };

  const handleAction = (id: string) => {
    onAction(id);
    onClose();
  };

  return (
    <div 
      ref={menuRef}
      className="fixed z-[200] w-[220px] bg-panel border border-default rounded-[8px] shadow-[0_12px_24px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.02)] py-1.5 font-ui animate-[fadeScaleIn_80ms_cubic-bezier(0.16,1,0.3,1)]"
      style={menuStyle}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="px-3 py-1 mb-1 text-[10px] font-semibold tracking-wider text-muted uppercase">
        NEXUS AI
      </div>
      <button onClick={() => handleAction('ai-fix')} className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-overlay text-[13px] text-secondary hover:text-primary group transition-colors duration-75">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent-violet group-hover:text-accent-violet-hover" />
          <span>Fix with AI</span>
        </div>
        <span className="text-[11px] font-mono text-muted">⌘⇧F</span>
      </button>
      <button onClick={() => handleAction('ai-explain')} className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-overlay text-[13px] text-secondary hover:text-primary transition-colors duration-75">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-muted" />
          <span>Explain Code</span>
        </div>
        <span className="text-[11px] font-mono text-muted">⌘⇧E</span>
      </button>
      <button onClick={() => handleAction('ai-optimize')} className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-overlay text-[13px] text-secondary hover:text-primary transition-colors duration-75">
        <div className="flex items-center gap-2">
          <Code size={14} className="text-muted" />
          <span>Optimize</span>
        </div>
        <span className="text-[11px] font-mono text-muted">⌘⇧O</span>
      </button>
      
      <div className="my-1 border-t border-default" />
      
      <button onClick={() => handleAction('edit-cut')} className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-overlay text-[13px] text-secondary hover:text-primary transition-colors duration-75">
        <div className="flex items-center gap-2">
          <Scissors size={14} className="text-muted" />
          <span>Cut</span>
        </div>
        <span className="text-[11px] font-mono text-muted">⌘X</span>
      </button>
      <button onClick={() => handleAction('edit-copy')} className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-overlay text-[13px] text-secondary hover:text-primary transition-colors duration-75">
        <div className="flex items-center gap-2">
          <Copy size={14} className="text-muted" />
          <span>Copy</span>
        </div>
        <span className="text-[11px] font-mono text-muted">⌘C</span>
      </button>
      <button onClick={() => handleAction('edit-paste')} className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-overlay text-[13px] text-secondary hover:text-primary transition-colors duration-75">
        <div className="flex items-center gap-2">
          <ClipboardPaste size={14} className="text-muted" />
          <span>Paste</span>
        </div>
        <span className="text-[11px] font-mono text-muted">⌘V</span>
      </button>
      
      <div className="my-1 border-t border-default" />
      
      <button onClick={() => handleAction('format')} className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-overlay text-[13px] text-secondary hover:text-primary transition-colors duration-75">
        <span>Format Document</span>
        <span className="text-[11px] font-mono text-muted">⌥⇧F</span>
      </button>
    </div>
  );
};
