import React, { useEffect, useRef } from 'react';
import { useEditorStore, useLayoutStore } from '../../store';
import Editor, { OnMount } from '@monaco-editor/react';
import { WelcomeScreen } from './WelcomeScreen';
import { DiffViewer } from './DiffViewer';

export const EditorArea: React.FC = () => {
  const { openFiles, activeFileId, updateFileContent, setActiveSelection, diffState, setLanguage } = useEditorStore();
  const { sidebarWidth, aiPanelWidth } = useLayoutStore();
  
  const activeFile = openFiles.find(f => f.id === activeFileId);
  const editorRef = useRef<any>(null);

  // Auto-detect language on mount/active file change for untitled files
  useEffect(() => {
    if (activeFile && activeFile.name === 'Untitled' && (activeFile.language === 'plaintext' || !activeFile.language)) {
      const content = activeFile.content;
      let detected = '';
      const lower = content.toLowerCase();
      if (content.includes('print(') || content.includes('def ')) detected = 'python';
      else if (content.includes('function') || content.includes('const ') || content.includes('console.log')) detected = 'javascript';
      else if (content.includes('import React') || content.includes('export const')) detected = 'typescript';
      else if (content.includes('<html>') || content.includes('<div>')) detected = 'html';
      else if (content.includes('package main') || content.includes('func main')) detected = 'go';
      else if (lower.includes('#include') || lower.includes('int main')) detected = 'cpp';

      if (detected) {
        setLanguage(activeFile.id, detected);
      }
    }
  }, [activeFileId, activeFile?.content]);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    
    editor.onDidChangeCursorSelection((e) => {
      const selection = editor.getModel()?.getValueInRange(e.selection);
      setActiveSelection(selection || null);
    });

    // Custom theme configuration if needed
    // monaco.editor.defineTheme('nexus-dark', {...});
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);
    }
  };

  if (diffState?.active) {
    return <DiffViewer />;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#050507] relative overflow-hidden">
      {/* Editor Container */}
      <div className="flex-1 relative">
        {activeFile ? (
          <Editor
            height="100%"
            path={activeFile.path}
            defaultLanguage={activeFile.language}
            language={activeFile.language}
            value={activeFile.content}
            theme="vs-dark"
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: true, scale: 0.75, renderCharacters: false },
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
              lineHeight: 1.8,
              padding: { top: 20, bottom: 20 },
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              contextmenu: true,
              quickSuggestions: true,
              bracketPairColorization: { enabled: true },
              guides: { indentation: true },
              renderLineHighlight: 'all',
              wordWrap: 'on',
              links: true,
              fontLigatures: true,
              roundedSelection: true,
            }}
          />
        ) : (
          <WelcomeScreen />
        )}
      </div>

      {/* Floating Action Hint */}
      {activeFile && (
        <div className="absolute bottom-10 right-10 flex items-center gap-4 animate-[fadeSlideUp_0.5s_ease-out]">
          <div className="px-4 py-2 bg-overlay/80 backdrop-blur-md border border-default rounded-2xl shadow-2xl flex items-center gap-3 text-[11px] text-muted font-ui">
            <span className="flex items-center gap-1.5"><kbd className="bg-surface px-1.5 py-0.5 rounded border border-default">⌘</kbd><kbd className="bg-surface px-1.5 py-0.5 rounded border border-default">K</kbd> AI Actions</span>
            <div className="w-[1px] h-3 bg-default" />
            <span className="flex items-center gap-1.5"><kbd className="bg-surface px-1.5 py-0.5 rounded border border-default">⌘</kbd><kbd className="bg-surface px-1.5 py-0.5 rounded border border-default">P</kbd> Open File</span>
          </div>
        </div>
      )}
    </div>
  );
};
