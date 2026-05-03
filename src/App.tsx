import React, { useEffect } from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { ActivityBar } from './components/layout/ActivityBar';
import { Sidebar } from './components/layout/Sidebar';
import { EditorArea } from './components/layout/EditorArea';
import { AIPanel } from './components/layout/AIPanel';
import { TerminalPanel } from './components/layout/TerminalPanel';
import { StatusBar } from './components/layout/StatusBar';
import { ResizableBorder } from './components/layout/ResizableBorder';
import { SettingsPanel } from './components/layout/SettingsPanel';
import { CommandPalette } from './components/ui/CommandPalette';
import { ToastContainer } from './components/ui/Toast';
import { ShortcutsOverlay } from './components/ui/ShortcutsOverlay';
import { useLayoutStore, useSettingsStore, useUIStore } from './store';
import { applyTheme } from './themes/themeManager';

function App() {
  const { theme, density, accentHue } = useSettingsStore();
  const { setSidebarWidth, setAIPanelWidth, setTerminalHeight, setTerminalOpen, terminalOpen } = useLayoutStore();
  const { commandPaletteOpen, setCommandPaletteOpen, setActiveModal } = useUIStore();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Apply Density and Accent Hue
  useEffect(() => {
    const root = document.documentElement;
    const densityMap: Record<string, string> = {
      compact: '0.8',
      default: '1',
      comfortable: '1.2'
    };
    root.style.setProperty('--density-multiplier', densityMap[density]);
    root.style.setProperty('--accent-violet', `hsl(${accentHue}, 100%, 71%)`);
    root.style.setProperty('--accent-violet-hover', `hsl(${accentHue}, 100%, 75%)`);
    root.style.setProperty('--accent-violet-transparent', `hsla(${accentHue}, 100%, 71%, 0.2)`);
  }, [density, accentHue]);

  // Global Keybind Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      // ⌘K — Command Palette
      if (meta && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // ⌘, — Settings
      if (meta && e.key === ',') {
        e.preventDefault();
        setActiveModal('settings');
      }
      // ⌘J — Toggle Terminal
      if (meta && e.key === 'j') {
        e.preventDefault();
        setTerminalOpen(!terminalOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen, setActiveModal, setTerminalOpen, terminalOpen]);

  // Handle Resizing Constraints
  const handleSidebarResize = (delta: number) => {
    setSidebarWidth((prev) => Math.min(Math.max(prev + delta, 160), 400));
  };

  const handleAIPanelResize = (delta: number) => {
    setAIPanelWidth((prev) => Math.min(Math.max(prev - delta, 200), 500));
  };

  const handleTerminalResize = (delta: number) => {
    setTerminalHeight((prev) => Math.min(Math.max(prev - delta, 100), 600));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-base text-secondary font-ui selection:bg-accent-violet-transparent">
      <TitleBar />
      
      <div className="flex-1 flex overflow-hidden relative pb-[24px]">
        <ActivityBar />
        <Sidebar />
        <ResizableBorder onResize={handleSidebarResize} />
        
        <div className="flex-1 flex flex-col min-w-0 relative">
          <EditorArea />
          <TerminalPanel />
        </div>
        
        <ResizableBorder onResize={handleAIPanelResize} />
        <AIPanel />
      </div>

      <StatusBar />
      
      {commandPaletteOpen && <CommandPalette />}
      <SettingsPanel />
      <ToastContainer />
      <ShortcutsOverlay />
    </div>
  );
}

export default App;

