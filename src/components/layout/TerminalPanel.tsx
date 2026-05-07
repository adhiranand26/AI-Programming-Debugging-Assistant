import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { useLayoutStore, useTerminalStore, useSettingsStore } from '../../store';
import { Plus, X, Trash2, SplitSquareHorizontal, RefreshCw } from 'lucide-react';

const TerminalInstance = ({ active }: { active: boolean }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { terminalHeight } = useLayoutStore();
  const { editorFontSize } = useSettingsStore();
  const { pendingCommand, setPendingCommand } = useTerminalStore();
  const [term, setTerm] = useState<Terminal | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const connect = () => {
    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket('ws://127.0.0.1:3001');
    wsRef.current = ws;
    ws.onopen = () => {
      setIsConnected(true);
      term?.writeln('\x1b[32m[SYSTEM]\x1b[0m Node bridge connected.');
    };
    ws.onmessage = (event) => term?.write(event.data);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);
  };

  useEffect(() => {
    if (!terminalRef.current) return;

    const newTerm = new Terminal({
      theme: {
        background: '#09090b',
        foreground: '#e8e8f0',
        cursor: '#7c6fff',
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
      // Use a strictly monospace font stack to prevent spacing issues
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      fontSize: editorFontSize || 13,
      cursorBlink: true,
      scrollback: 5000,
      allowProposedApi: true,
      letterSpacing: 0,
      fontWeight: '400'
    });

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    newTerm.loadAddon(fitAddon);
    newTerm.loadAddon(new WebLinksAddon());

    newTerm.open(terminalRef.current);
    
    // Modern minimal welcome message
    newTerm.writeln('\x1b[1;35m● NEXUS TERMINAL\x1b[0m \x1b[2mv1.0\x1b[0m');
    newTerm.writeln('\x1b[2mType commands below to execute locally.\x1b[0m');
    newTerm.writeln('');

    setTerm(newTerm);
    
    const ws = new WebSocket('ws://127.0.0.1:3001');
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      newTerm.writeln('\x1b[32m✔\x1b[0m Bridge connected. Session ready.');
      newTerm.write('\r\n');
    };

    ws.onmessage = (event) => newTerm.write(event.data);

    ws.onerror = (e) => {
      console.error("WebSocket Error", e);
      setIsConnected(false);
      newTerm.writeln('\x1b[31m✖\x1b[0m Connection failed. Is the bridge running?');
      newTerm.write('\x1b[36muser@nexus\x1b[0m:\x1b[34m~\x1b[0m$ ');
    };
    
    ws.onclose = () => {
      setIsConnected(false);
    };

    newTerm.onData(e => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(e);
      } else {
        if (e === '\r') {
          newTerm.writeln('\r\n\x1b[2m(Simulation Mode: Bridge Not Found)\x1b[0m');
          newTerm.write('\x1b[36muser@nexus\x1b[0m:\x1b[34m~\x1b[0m$ ');
        } else if (e === '\u007F') {
          newTerm.write('\b \b');
        } else {
          newTerm.write(e);
        }
      }
    });

    setTimeout(() => {
      try { fitAddon.fit(); } catch (e) {}
    }, 100);

    return () => {
      ws.close();
      newTerm.dispose();
    };
  }, []);

  useEffect(() => {
    if (active && fitAddonRef.current) {
      setTimeout(() => {
        try { fitAddonRef.current?.fit(); } catch (e) {}
      }, 50);
    }
  }, [terminalHeight, active]);

  useEffect(() => {
    if (active && pendingCommand && term) {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(pendingCommand + '\n');
      } else {
        term.writeln('\r\n\x1b[33m[RUN]\x1b[0m ' + pendingCommand);
        term.write('\x1b[36muser@nexus\x1b[0m:\x1b[34m~\x1b[0m$ ');
      }
      setPendingCommand(null);
    }
  }, [pendingCommand, active, term, setPendingCommand]);

  return (
    <div 
      className="absolute inset-0" 
      style={{ opacity: active ? 1 : 0, pointerEvents: active ? 'auto' : 'none', zIndex: active ? 10 : 0 }}
    >
      <div className="w-full h-full p-2 bg-[#09090b]" ref={terminalRef} />
      
      {!isConnected && (
        <div 
          onClick={connect}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] z-50 cursor-pointer group hover:bg-black/40 transition-all"
        >
          <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-panel border border-warning/20 shadow-2xl animate-[fadeSlideUp_0.3s_ease-out]">
            <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center text-warning group-hover:scale-110 transition-transform">
              <RefreshCw size={32} className="animate-[spin_4s_linear_infinite]" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-primary">Terminal Bridge Offline</h3>
              <p className="text-sm text-muted max-w-[200px]">Click anywhere to attempt reconnection</p>
            </div>
            <button className="px-6 py-2 rounded-xl bg-warning text-black font-bold text-sm shadow-lg shadow-warning/20 hover:scale-105 active:scale-95 transition-all">
              RECONNECT NOW
            </button>
          </div>
        </div>
      )}
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
      <div className="flex-1 relative overflow-hidden">
        {terminals.map(t => (
          <TerminalInstance key={t.id} active={t.id === activeTerminalId} />
        ))}
      </div>
    </div>
  );
};
