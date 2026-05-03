import React, { useState, useRef, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useSettingsStore, useEditorStore, useUIStore } from '../../store';
import { TabBar } from '../editor/TabBar';
import { WelcomeScreen } from '../editor/WelcomeScreen';
import { ContextMenu } from '../ui/ContextMenu';
import { DiffPanel } from '../editor/DiffPanel';
import { getLanguageFromPath } from '../../utils/language';

export const EditorArea: React.FC = () => {
  const { editorFont, editorFontSize, editorLineHeight, wordWrap, minimap, ligatures } = useSettingsStore();
  const { openFiles, activeFileId, updateFileContent, setActiveSelection } = useEditorStore();
  const { setCommandPaletteOpen } = useUIStore();
  
  const monaco = useMonaco();
  const editorContainerRef = useRef<HTMLDivElement>(null);
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const activeFile = openFiles.find(f => f.id === activeFileId);

  // Define custom theme
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('nexus-theme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'string', foreground: 'eab308' }, // amber-500
          { token: 'keyword', foreground: '8b5cf6' }, // violet-500
          { token: 'function', foreground: '06b6d4' }, // cyan-500
          { token: 'type', foreground: '22c55e' }, // green-500
          { token: 'number', foreground: 'f43f5e' }, // rose-500
          { token: 'comment', foreground: '71717a', fontStyle: 'italic' }, // zinc-500
        ],
        colors: {
          'editor.background': '#09090b',
          'editorCursor.foreground': '#7c6fff',
          'editor.lineHighlightBackground': '#ffffff08',
          'editor.selectionBackground': '#7c6fff40',
          'editorLineNumber.foreground': '#5a5a72',
          'editorLineNumber.activeForeground': '#9898b0',
          'diffEditor.removedTextBackground': '#ff4d6d1a', // 10%
          'diffEditor.insertedTextBackground': '#36d3991a', // 10%
        }
      });
      monaco.editor.setTheme('nexus-theme');
    }
  }, [monaco]);

  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);
    }
  };

  const handleEditorMount = (editor: any) => {
    editor.onDidChangeCursorSelection((e: any) => {
      const selection = editor.getModel().getValueInRange(e.selection);
      setActiveSelection(selection);
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleContextAction = (actionId: string) => {
    setContextMenu(null);
    if (actionId === 'format' && monaco && activeFileId) {
      const editor = monaco.editor.getEditors()[0];
      if (editor) {
        editor.getAction('editor.action.formatDocument')?.run();
      }
    } else {
      // Trigger code action via the lib when implemented later, for now just log
      // The context menu calls ai-fix, ai-explain, ai-optimize
      import('../../lib/codeActions').then(({ runCodeAction }) => {
        let mappedId = '';
        if (actionId === 'ai-fix') mappedId = 'FIX';
        if (actionId === 'ai-explain') mappedId = 'EXPLAIN';
        if (actionId === 'ai-optimize') mappedId = 'OPTIMIZE';
        if (mappedId) runCodeAction(mappedId);
      });
    }
  };

  if (openFiles.length === 0) {
    return <WelcomeScreen />;
  }

  return (
    <div 
      className="flex-1 flex flex-col h-full bg-base overflow-hidden relative"
      onContextMenu={handleContextMenu}
      ref={editorContainerRef}
    >
      <TabBar />

      {/* Editor Container */}
      <div className="flex-1 relative bg-[#09090b]">
        {activeFile ? (
          <Editor
            key={activeFile.id}
            path={activeFile.path}
            height="100%"
            language={activeFile.language}
            value={activeFile.content}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme="nexus-theme"
            options={{
              fontFamily: editorFont,
              fontSize: editorFontSize,
              lineHeight: editorLineHeight,
              wordWrap: wordWrap ? 'on' : 'off',
              minimap: { enabled: minimap },
              fontLigatures: ligatures,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderLineHighlight: 'all',
              tabSize: 2,
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true, indentation: true },
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted">
            Select a file to edit
          </div>
        )}
      </div>

      <DiffPanel />

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onClose={() => setContextMenu(null)}
          onAction={handleContextAction}
        />
      )}
    </div>
  );
};
