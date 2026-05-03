import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { useLayoutStore, useTerminalStore, useSettingsStore } from '../../store';
import { Plus, X, Trash2, SplitSquareHorizontal } from 'lucide-react';

const TerminalInstance = ({ active }: { active: boolean }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const { terminalHeight } = useLayoutStore();
  const { editorFont, editorFontSize } = useSettingsStore();
  const { pendingCommand, setPendingCommand } = useTerminalStore();
  const [term, setTerm] = useState<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const newTerm = new Terminal({
      theme: {
        background: '#09090b',
        foreground: '#e8e8f0', // --text-secondary
        cursor: '#7c6fff', // --accent-violet
        selectionBackground: 'rgba(124, 111, 255, 0.25)',
        black: '#0a0a0c',
        red: '#ff4d6d',
        green: '#36d399',
        yellow: '#f5a623',
        blue: '#7c6fff',
        magenta: '#d1bbed',
        cyan: '#9ccfd8',
        white: '#ffffff',
      },
      fontFamily: editorFont || 'JetBrains Mono',
      fontSize: editorFontSize || 13,
      cursorBlink: true,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    newTerm.loadAddon(fitAddon);
    newTerm.loadAddon(new WebLinksAddon());

    newTerm.open(terminalRef.current);
    
    // Slight delay to ensure parent has rendered size
    setTimeout(() => fitAddon.fit(), 50);

    newTerm.writeln('\x1b[35m[NEXUS AI]\x1b[0m Terminal Ready. Type simulated commands.');
    newTerm.write('\x1b[36muser@nexus\x1b[0m:\x1b[34m~\x1b[0m$ ');

    // Handle basic simulated typing
    newTerm.onData(e => {
      if (e === '\r') {
        newTerm.writeln('');
        newTerm.writeln('\x1b[33m[Simulator]\x1b[0m Real execution requires a backend/Electron container.');
        newTerm.write('\x1b[36muser@nexus\x1b[0m:\x1b[34m~\x1b[0m$ ');
      } else if (e === '\u007F') {
        // Backspace
        newTerm.write('\b \b');
      } else {
        newTerm.write(e);
      }
    });

    setTerm(newTerm);

    return () => {
      newTerm.dispose();
    };
  }, []);

  // Handle Resize
  useEffect(() => {
    if (active && fitAddonRef.current) {
      // Need timeout because height transition takes 180ms
      const timeout = setTimeout(() => {
        fitAddonRef.current?.fit();
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [terminalHeight, active]);

  // Handle pending command execution
  useEffect(() => {
    if (active && pendingCommand && term) {
      term.write(pendingCommand + '\r');
      term.writeln('\x1b[33m[Simulator]\x1b[0m Simulating execution of: ' + pendingCommand);
      term.writeln('Running in browser mode. Output is simulated.');
      term.writeln('');
      term.write('\x1b[36muser@nexus\x1b[0m:\x1b[34m~\x1b[0m$ ');
      setPendingCommand(null);
    }
  }, [pendingCommand, active, term, setPendingCommand]);

  return (
    <div 
      className="absolute inset-0" 
      style={{ opacity: active ? 1 : 0, pointerEvents: active ? 'auto' : 'none', zIndex: active ? 10 : 0 }}
    >
      <div className="w-full h-full p-2 bg-[#09090b]" ref={terminalRef} />
    </div>
  );
};

export const TerminalPanel: React.FC = () => {
  const { terminalHeight, terminalOpen, setTerminalOpen } = useLayoutStore();
  const { terminals, activeTerminalId, addTerminal, closeTerminal, setActiveTerminalId } = useTerminalStore();

  if (!terminalOpen) return null;

  return (
    <div 
      style={{ height: `${terminalHeight}px` }}
      className="w-full bg-[#09090b] border-t border-default flex flex-col flex-shrink-0 z-20 absolute bottom-[24px]"
    >
      {/* Header */}
      <div className="h-[34px] flex-shrink-0 flex items-center justify-between px-2 border-b border-default bg-panel">
        <div className="flex items-center h-full">
          {terminals.map(t => (
            <div 
              key={t.id}
              onClick={() => setActiveTerminalId(t.id)}
              className={`group flex items-center gap-2 h-full px-3 text-[11px] font-mono border-b-2 cursor-pointer transition-colors ${activeTerminalId === t.id ? 'border-accent-violet text-primary' : 'border-transparent text-muted hover:text-secondary'}`}
            >
              {t.title}
              <button 
                onClick={(e) => { e.stopPropagation(); closeTerminal(t.id); }}
                className={`p-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity ${activeTerminalId === t.id ? 'hover:bg-overlay text-muted hover:text-error' : ''}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button 
            onClick={() => addTerminal()}
            className="ml-2 p-1 text-muted hover:text-primary transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2 px-2">
          <button className="p-1 text-muted hover:text-primary transition-colors" title="Split Terminal">
            <SplitSquareHorizontal size={14} />
          </button>
          <button className="p-1 text-muted hover:text-error transition-colors" title="Kill Terminal">
            <Trash2 size={14} />
          </button>
          <div className="w-[1px] h-4 bg-default mx-1" />
          <button 
            onClick={() => setTerminalOpen(false)}
            className="p-1 text-muted hover:text-primary transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      {/* Instances Container */}
      <div className="flex-1 relative overflow-hidden">
        {terminals.map(t => (
          <TerminalInstance key={t.id} active={t.id === activeTerminalId} />
        ))}
      </div>
    </div>
  );
};
