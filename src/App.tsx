import { useEffect } from 'react';
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
import { useLayoutStore, useSettingsStore, useUIStore, useEditorStore } from './store';
import { applyTheme } from './themes/themeManager';

function App() {
  const { theme, density, accentHue } = useSettingsStore();
  const { setSidebarWidth, setAIPanelWidth, setTerminalOpen, terminalOpen } = useLayoutStore();
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
    const handleKeyDown = async (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      // ⌘S — Save
      if (meta && e.key === 's') {
        e.preventDefault();
        const { activeFileId, openFiles, saveFile } = useEditorStore.getState();
        const activeFile = openFiles.find(f => f.id === activeFileId);
        
        if (activeFile && activeFile.isDirty && activeFile.fileHandle) {
          try {
            const { writeFileContent } = await import('./services/fileSystem');
            await writeFileContent(activeFile.fileHandle, activeFile.content);
            saveFile(activeFile.id);
            const { addNotification } = useUIStore.getState();
            addNotification({ id: Date.now().toString(), type: 'success', message: `Saved ${activeFile.name}` });
          } catch (err) {
            console.error("Save failed", err);
            const { addNotification } = useUIStore.getState();
            addNotification({ id: Date.now().toString(), type: 'error', message: `Failed to save ${activeFile.name}` });
          }
        } else if (activeFile && activeFile.isDirty) {
          saveFile(activeFile.id);
        }
      }

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
        setTerminalOpen(!useLayoutStore.getState().terminalOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen, setActiveModal, setTerminalOpen]);

  const handleSidebarResize = (delta: number) => {
    const prev = useLayoutStore.getState().sidebarWidth;
    setSidebarWidth(Math.min(Math.max(prev + delta, 160), 400));
  };

  const handleAIPanelResize = (delta: number) => {
    const prev = useLayoutStore.getState().aiPanelWidth;
    setAIPanelWidth(Math.min(Math.max(prev - delta, 200), 500));
  };

  const handleTerminalResize = (delta: number) => {
    const prev = useLayoutStore.getState().terminalHeight;
    useLayoutStore.getState().setTerminalHeight(Math.min(Math.max(prev - delta, 100), 600));
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
          {terminalOpen && (
            <>
              <ResizableBorder isVertical onResize={handleTerminalResize} />
              <TerminalPanel />
            </>
          )}
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
