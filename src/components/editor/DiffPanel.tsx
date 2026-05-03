import React, { useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { useEditorStore, useSettingsStore } from '../../store';
import { Check, X } from 'lucide-react';

export const DiffPanel: React.FC = () => {
  const { diffState, setDiffState, updateFileContent } = useEditorStore();
  const { editorFont, editorFontSize, editorLineHeight } = useSettingsStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!diffState?.active) return;
      
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleApply();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleReject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [diffState]);

  if (!diffState?.active) return null;

  const handleApply = () => {
    updateFileContent(diffState.fileId, diffState.modifiedContent);
    setDiffState(null);
  };

  const handleReject = () => {
    setDiffState(null);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 flex flex-col bg-panel border-t border-default animate-[fadeScaleIn_120ms_ease-out]" style={{ height: '400px' }}>
      {/* Header */}
      <div className="h-[40px] flex items-center justify-between px-4 border-b border-default bg-elevated">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-semibold text-primary uppercase tracking-wider">Review Changes</span>
          <span className="text-[11px] font-mono text-muted">{diffState.filename}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleReject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-muted hover:text-error hover:bg-overlay transition-colors"
          >
            <X size={14} /> Reject <span className="font-mono opacity-50 ml-1">ESC</span>
          </button>
          <button 
            onClick={handleApply}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-white bg-success/90 hover:bg-success transition-colors shadow-[0_0_10px_rgba(54,211,153,0.2)]"
          >
            <Check size={14} /> Apply <span className="font-mono opacity-80 ml-1">⌘↵</span>
          </button>
        </div>
      </div>
      
      {/* Editor */}
      <div className="flex-1 relative bg-[#09090b]">
        <DiffEditor
          original={diffState.originalContent}
          modified={diffState.modifiedContent}
          theme="nexus-theme"
          options={{
            fontFamily: editorFont,
            fontSize: editorFontSize,
            lineHeight: editorLineHeight,
            minimap: { enabled: false },
            renderSideBySide: true,
            readOnly: true,
            originalEditable: false,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            renderOverviewRuler: false,
            enableSplitViewResizing: true,
          }}
        />
      </div>
    </div>
  );
};
