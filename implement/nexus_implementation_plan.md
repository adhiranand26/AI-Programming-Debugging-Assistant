# NEXUS AI - Implementation Plan

## 1. Folder Structure
```text
src/
  components/
    layout/
      TitleBar.tsx
      ActivityBar.tsx
      Sidebar.tsx
      EditorArea.tsx
      AIPanel.tsx
      TerminalPanel.tsx
      StatusBar.tsx
      ResizableBorder.tsx
    ui/
      Toast.tsx
      Tooltip.tsx
      Badge.tsx
      Button.tsx
  store/
    index.ts
    layout.ts
    editor.ts
    ai.ts
    settings.ts
    ui.ts
  themes/
    sovereign.ts
    obsidian.ts
    nord.ts
    rosePine.ts
    catppuccin.ts
    themeManager.ts
  styles/
    globals.css
  App.tsx
  main.tsx
```

## 2. Dependencies
- **react, react-dom**: Core UI library.
- **vite**: Lightning-fast local development server and bundler.
- **tailwindcss, postcss, autoprefixer**: For utility-class layout building (strictly configured to use our CSS variables, no default colors).
- **zustand**: Lightweight, fast state management with localStorage persistence for our 5 store slices.
- **@monaco-editor/react**: The core code editor powering the IDE.
- **xterm, xterm-addon-fit, xterm-addon-web-links**: Full-featured terminal emulator for the bottom panel.
- **lucide-react**: Clean, consistent SVG icon set (as requested).

## 3. Zustand Store Shape
```typescript
interface LayoutState {
  sidebarWidth: number; // default: 220
  aiPanelWidth: number; // default: 280
  terminalHeight: number; // default: 200
  terminalOpen: boolean; // default: false
  activeSidebarTab: 'files' | 'search' | 'git' | 'outline';
  activeLayoutProfile: string; // default: 'coding'
}

interface EditorState {
  openFiles: FileTab[];
  activeFileId: string | null;
  unsavedFileIds: string[];
}

interface AIState {
  messages: AIMessage[];
  isStreaming: boolean;
  mode: 'chat' | 'code';
  pinnedFiles: string[];
  activeModel: string; // default: 'llama3'
  contextWindowUsage: number;
}

interface SettingsState {
  theme: string; // default: 'sovereign'
  uiFont: string; // default: 'Space Grotesk'
  editorFont: string; // default: 'JetBrains Mono'
  uiFontSize: number; // default: 13
  editorFontSize: number; // default: 14
  editorLineHeight: number; // default: 1.8
  density: 'compact' | 'default' | 'comfortable';
  accentColor: string;
  keybindingProfile: 'default' | 'vscode' | 'vim' | 'emacs';
  formatOnSave: boolean;
  wordWrap: boolean;
  minimap: boolean;
  ligatures: boolean;
}

interface UIState {
  commandPaletteOpen: boolean;
  notifications: Notification[];
  activeModal: string | null;
}
```

## 4. CSS Variable List (Tokens)
Defined in `globals.css` and manipulated by themes:
- **Fonts**: `--font-ui` (Space Grotesk), `--font-mono` (JetBrains Mono)
- **Backgrounds**: 
  - `--bg-base` (Main editor area)
  - `--bg-panel` (Sidebars, activity bar, terminal)
  - `--bg-overlay` (Scrollbar tracks, dropdowns, modals)
  - `--bg-active` (Selected files/tabs)
- **Text**: 
  - `--text-primary` (Bright text, titles, active tabs)
  - `--text-secondary` (Standard body/UI text)
  - `--text-muted` (Dim text, separators, inactive icons)
- **Borders**: 
  - `--border-default` (Standard dividers/panel borders)
  - `--border-hover`, `--border-active`
- **Accents**: 
  - `--accent-violet` (Primary brand color)
  - `--accent-violet-hover`, `--accent-violet-transparent` (for ResizableBorder hover)
- **Semantic Colors**: 
  - `--color-error` (#ff4d6d)
  - `--color-warning` (#f5a623)
  - `--color-success` (#36d399)
- **Radii**: `--radius-sm`, `--radius-md`, `--radius-lg`
- **Spacings**: `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`

## 5. Panel Resizing Technical Implementation
- **Component**: `ResizableBorder.tsx`
- **Implementation**:
  - The border will be a 4px wide `div` with `cursor: col-resize`.
  - On `mousedown`, we prevent default selection and attach `mousemove` and `mouseup` listeners to the `window` (to smoothly track dragging even if the mouse leaves the border element).
  - The `mousemove` handler calculates the drag delta and updates `sidebarWidth` or `aiPanelWidth` in the Zustand `layout` slice.
  - Zustand pushes state updates rapidly. Our Flexbox layout uses these pixel widths directly inline or via styled components.
  - On `mouseup`, we detach the listeners.
  - **Styling**: Normal state is transparent. Hover triggers a transition to 20% opacity `--accent-violet`. Active/dragging triggers 100% opacity `--accent-violet` with an 80ms transition duration.

## 6. Theme Switching Technical Implementation
- **Structure**: Each theme in `src/themes/` is a plain TypeScript object matching our CSS Variable keys (e.g., `export const sovereign = { '--bg-base': '#121212', ... }`).
- **Logic**: The `themeManager.ts` exports a single `applyTheme(themeName: string)` function.
- **Application**: The function retrieves the relevant theme object and iterates over its keys, applying them via `document.documentElement.style.setProperty(key, value)`.
- **Reactivity**: We'll use a `useEffect` inside `App.tsx` that listens to `settings.theme` from our Zustand store. When the theme string changes, it calls `applyTheme(newTheme)`, causing an instant CSS update globally with zero reload required.
- **Persistence**: Zustand's `persist` middleware will automatically save the chosen theme to `localStorage`, so the app boots up exactly as it was closed.
