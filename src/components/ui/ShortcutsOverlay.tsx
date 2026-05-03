import React, { useEffect, useState } from 'react';

const SECTIONS = [
  {
    title: 'Navigation',
    shortcuts: [
      { action: 'Command Palette', keys: ['⌘', 'K'] },
      { action: 'Quick Open', keys: ['⌘', 'P'] },
      { action: 'Settings', keys: ['⌘', ','] },
      { action: 'Toggle Sidebar', keys: ['⌘', 'B'] },
      { action: 'Toggle Terminal', keys: ['⌘', 'J'] },
    ],
  },
  {
    title: 'Editor',
    shortcuts: [
      { action: 'Save', keys: ['⌘', 'S'] },
      { action: 'Undo', keys: ['⌘', 'Z'] },
      { action: 'Redo', keys: ['⌘', '⇧', 'Z'] },
      { action: 'Select Word', keys: ['⌘', 'D'] },
      { action: 'Delete Line', keys: ['⌘', '⇧', 'K'] },
      { action: 'Toggle Comment', keys: ['⌘', '/'] },
    ],
  },
  {
    title: 'AI Actions',
    shortcuts: [
      { action: 'Fix', keys: ['⌘', '⇧', 'F'] },
      { action: 'Explain', keys: ['⌘', '⇧', 'E'] },
      { action: 'Optimize', keys: ['⌘', '⇧', 'O'] },
      { action: 'Generate Tests', keys: ['⌘', '⇧', 'T'] },
      { action: 'Generate Docs', keys: ['⌘', '⇧', 'D'] },
      { action: 'Refactor', keys: ['⌘', '⇧', 'R'] },
    ],
  },
  {
    title: 'Terminal',
    shortcuts: [
      { action: 'Toggle Terminal', keys: ['⌘', 'J'] },
      { action: 'New Terminal', keys: ['⌘', '⇧', '`'] },
    ],
  },
  {
    title: 'Settings',
    shortcuts: [
      { action: 'Open Settings', keys: ['⌘', ','] },
      { action: 'This Cheatsheet', keys: ['?'] },
    ],
  },
];

export const ShortcutsOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger on ? when not inside an input/textarea/monaco
      const target = e.target as HTMLElement;
      const isEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('.monaco-editor') !== null ||
        target.getAttribute('contenteditable') === 'true';

      if (e.key === '?' && !isEditable) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-base/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        style={{ animation: 'fadeScaleIn 80ms cubic-bezier(0.16,1,0.3,1) forwards' }}
      />

      {/* Content */}
      <div
        className="relative bg-elevated border border-strong rounded-[12px] shadow-2xl max-w-[640px] w-full max-h-[480px] overflow-y-auto no-scrollbar p-8"
        style={{ animation: 'fadeScaleIn 120ms cubic-bezier(0.16,1,0.3,1) forwards' }}
      >
        <h2 className="text-[15px] font-semibold text-primary mb-6">Keyboard Shortcuts</h2>

        <div className="flex flex-col gap-6">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {section.shortcuts.map((s) => (
                  <div key={s.action} className="flex items-center justify-between py-1">
                    <span className="text-[13px] text-secondary">{s.action}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((key, i) => (
                        <kbd
                          key={i}
                          className="bg-overlay border border-default rounded px-1.5 py-0.5 font-mono text-[11px] text-primary min-w-[22px] text-center"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-[11px] text-muted">
          Press <kbd className="bg-overlay border border-default rounded px-1.5 py-0.5 font-mono text-[11px] text-primary">?</kbd> or <kbd className="bg-overlay border border-default rounded px-1.5 py-0.5 font-mono text-[11px] text-primary">ESC</kbd> to close
        </div>
      </div>
    </div>
  );
};
