import { useSettingsStore } from '../store';

export const parseVSCodeTheme = (jsonString: string) => {
  try {
    const theme = JSON.parse(jsonString);
    const colors = theme.colors || {};

    const colorMap: Record<string, string> = {
      '--bg-base': colors['editor.background'] || '#0a0a0c',
      '--bg-panel': colors['sideBar.background'] || colors['editorGroupHeader.tabsBackground'] || '#111114',
      '--bg-overlay': colors['dropdown.background'] || colors['editorWidget.background'] || '#1a1a1f',
      '--text-primary': colors['editor.foreground'] || '#ffffff',
      '--text-secondary': colors['sideBar.foreground'] || colors['tab.inactiveForeground'] || '#a0a0ab',
      '--text-muted': colors['descriptionForeground'] || '#6b6b76',
      '--border-default': colors['sideBar.border'] || colors['editorGroup.border'] || '#232329',
      '--accent-violet': colors['textLink.foreground'] || colors['button.background'] || '#7c6fff',
    };

    // Inject temporary preview into document
    const root = document.documentElement;
    Object.entries(colorMap).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    return true;
  } catch (err) {
    console.error('Failed to parse VS Code theme:', err);
    return false;
  }
};
