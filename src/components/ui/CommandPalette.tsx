import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUIStore, useSettingsStore } from '../../store';
import { Search, ChevronRight, FileText, Sparkles, Terminal, Code, Palette, Type } from 'lucide-react';

interface Command {
  id: string;
  category: 'AI ACTIONS' | 'EDITOR' | 'SETTINGS' | 'FILES';
  label: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
  subPromptPlaceholder?: string;
}

const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  const chars = text.split('');
  const matchChars = highlight.toLowerCase().split('');
  let matchIndex = 0;

  return (
    <span>
      {chars.map((char, index) => {
        const isMatch = matchIndex < matchChars.length && char.toLowerCase() === matchChars[matchIndex];
        if (isMatch) matchIndex++;

        return (
          <span
            key={index}
            className={isMatch ? 'text-accent-violet font-medium' : ''}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
};

export const CommandPalette: React.FC = () => {
  const { setCommandPaletteOpen } = useUIStore();
  // removed theme
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [subPrompt, setSubPrompt] = useState<'theme' | 'model' | 'font' | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const closePalette = () => {
    setIsClosing(true);
    setTimeout(() => {
      setCommandPaletteOpen(false);
    }, 80); // matches animation duration
  };

  const handleEscape = () => {
    if (subPrompt) {
      setSubPrompt(null);
      setQuery('');
    } else {
      closePalette();
    }
  };

  const baseCommands: Command[] = useMemo(() => [
    {
      id: 'ai-fix',
      category: 'AI ACTIONS',
      label: 'Fix Code with AI',
      icon: Sparkles,
      shortcut: '⌘⇧F',
      action: () => console.log('Fix Code')
    },
    {
      id: 'ai-explain',
      category: 'AI ACTIONS',
      label: 'Explain Selection',
      icon: FileText,
      shortcut: '⌘⇧E',
      action: () => console.log('Explain Selection')
    },
    {
      id: 'editor-format',
      category: 'EDITOR',
      label: 'Format Document',
      icon: Code,
      shortcut: '⌥⇧F',
      action: () => console.log('Format Document')
    },
    {
      id: 'theme-change',
      category: 'SETTINGS',
      label: 'Change Theme',
      icon: Palette,
      subPromptPlaceholder: 'Select a theme...',
      action: () => setSubPrompt('theme')
    },
    {
      id: 'font-change',
      category: 'SETTINGS',
      label: 'Change Editor Font',
      icon: Type,
      subPromptPlaceholder: 'Select a font...',
      action: () => setSubPrompt('font')
    },
    {
      id: 'toggle-terminal',
      category: 'EDITOR',
      label: 'Toggle Terminal',
      icon: Terminal,
      shortcut: '⌘J',
      action: () => console.log('Toggle Terminal')
    }
  ], []);

  const subPromptOptions = useMemo(() => {
    if (subPrompt === 'theme') {
      return [
        { id: 'theme-sovereign', label: 'Sovereign (Dark)', action: () => { useSettingsStore.setState({ theme: 'sovereign' }); closePalette(); } },
        { id: 'theme-obsidian', label: 'Obsidian (Black)', action: () => { useSettingsStore.setState({ theme: 'obsidian' }); closePalette(); } },
        { id: 'theme-nord', label: 'Nord', action: () => { useSettingsStore.setState({ theme: 'nord' }); closePalette(); } },
        { id: 'theme-rose', label: 'Rosé Pine', action: () => { useSettingsStore.setState({ theme: 'rosePine' }); closePalette(); } },
        { id: 'theme-catppuccin', label: 'Catppuccin', action: () => { useSettingsStore.setState({ theme: 'catppuccin' }); closePalette(); } },
      ];
    }
    if (subPrompt === 'font') {
      return [
        { id: 'font-jb', label: 'JetBrains Mono', action: () => { useSettingsStore.setState({ editorFont: 'JetBrains Mono' }); closePalette(); } },
        { id: 'font-fira', label: 'Fira Code', action: () => { useSettingsStore.setState({ editorFont: 'Fira Code' }); closePalette(); } },
        { id: 'font-cascadia', label: 'Cascadia Code', action: () => { useSettingsStore.setState({ editorFont: 'Cascadia Code' }); closePalette(); } },
      ];
    }
    return [];
  }, [subPrompt]);

  const filteredItems = useMemo(() => {
    if (subPrompt) {
      return subPromptOptions.filter(opt => {
        // Simple sequential fuzzy match
        const searchRegex = new RegExp(query.split('').join('.*'), 'i');
        return searchRegex.test(opt.label);
      });
    }

    return baseCommands.filter(cmd => {
      const searchRegex = new RegExp(query.split('').join('.*'), 'i');
      return searchRegex.test(cmd.label);
    });
  }, [query, baseCommands, subPrompt, subPromptOptions]);

  // Group commands by category if we are not in a subprompt
  const groupedItems = useMemo(() => {
    if (subPrompt) return null;
    
    const groups: Record<string, Command[]> = {};
    filteredItems.forEach(item => {
      const cmd = item as Command;
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredItems, subPrompt]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleEscape();
        return;
      }

      if (filteredItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected && 'action' in selected) {
          selected.action();
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Skip logic for simplicity right now: jump by 3 or to next section
        setSelectedIndex(prev => (prev + 3) % filteredItems.length);
      } else if (e.key === 'Backspace' && query === '' && subPrompt) {
        e.preventDefault();
        setSubPrompt(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedIndex, subPrompt, query]);

  // Reset selection when query/subprompt changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, subPrompt]);

  // Auto-scroll
  useEffect(() => {
    const el = itemRefs.current[selectedIndex];
    if (el && listRef.current) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [subPrompt]);

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closePalette();
    }
  };

  let itemIndexCounter = 0;

  return (
    <div 
      className={`fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-base/60 backdrop-blur-[4px] ${isClosing ? 'animate-palette-close' : 'animate-palette-open'}`}
      onMouseDown={handleOutsideClick}
    >
      <div className="w-[560px] max-h-[400px] bg-elevated rounded-[12px] border border-strong shadow-[0_24px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden flex flex-col font-ui relative">
        
        {/* Header / Input */}
        <div className="flex items-center px-4 h-14 border-b border-subtle flex-shrink-0">
          {subPrompt ? (
            <button 
              onClick={() => { setSubPrompt(null); setQuery(''); }}
              className="mr-3 text-muted hover:text-primary transition-colors"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
          ) : (
            <Search size={18} className="text-muted mr-3" />
          )}
          
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-[14px] text-primary placeholder:text-muted h-full"
            placeholder={subPrompt ? `Select a ${subPrompt}...` : "Search commands, files, or actions..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {subPrompt && (
            <div className="px-2 py-0.5 rounded bg-overlay border border-default text-[11px] text-muted font-medium ml-3 uppercase tracking-wider">
              {subPrompt}
            </div>
          )}
        </div>

        {/* List Body */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto py-2 no-scrollbar"
        >
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted">
              <span className="text-[13px]">No matching results</span>
            </div>
          ) : subPrompt ? (
            // Flat List for SubPrompts
            <div className="px-2">
              {filteredItems.map((item, idx) => {
                const isActive = idx === selectedIndex;
                const i = itemIndexCounter++;
                return (
                  <button
                    key={item.id}
                    ref={el => { itemRefs.current[i] = el; }}
                    onClick={() => { item.action(); setSelectedIndex(i); }}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-colors duration-75 ${isActive ? 'bg-accent-violet text-white' : 'text-secondary hover:bg-overlay'}`}
                  >
                    <span className="text-[13px] font-medium"><HighlightedText text={item.label} highlight={query} /></span>
                  </button>
                );
              })}
            </div>
          ) : (
            // Grouped List for Base Commands
            <div className="px-2">
              {['AI ACTIONS', 'EDITOR', 'FILES', 'SETTINGS'].map((category) => {
                if (!groupedItems![category] || groupedItems![category].length === 0) return null;
                
                return (
                  <div key={category} className="mb-2 last:mb-0">
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-muted tracking-wider">
                      {category}
                    </div>
                    {groupedItems![category].map((cmd) => {
                      const isActive = itemIndexCounter === selectedIndex;
                      const idx = itemIndexCounter++;
                      const Icon = cmd.icon;
                      
                      return (
                        <button
                          key={cmd.id}
                          ref={el => { itemRefs.current[idx] = el; }}
                          onClick={() => { cmd.action(); setSelectedIndex(idx); }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors duration-75 group ${isActive ? 'bg-accent-violet text-white' : 'text-secondary hover:bg-overlay'}`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={16} className={isActive ? 'text-white' : 'text-muted group-hover:text-secondary'} />
                            <span className="text-[13px] font-medium"><HighlightedText text={cmd.label} highlight={query} /></span>
                          </div>
                          
                          {cmd.shortcut && (
                            <span className={`text-[11px] font-mono ${isActive ? 'text-white/70' : 'text-muted'}`}>
                              {cmd.shortcut}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
