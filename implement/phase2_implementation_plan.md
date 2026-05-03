# NEXUS AI - Phase 2 Implementation Plan

## 1. Monaco Editor Theme & Setup
- **Theme Definition**: I will create a `beforeMount` handler for `@monaco-editor/react` that calls `monaco.editor.defineTheme('nexus-theme', {...})`.
- **Theme Colors**: 
  - Background: `#09090b`
  - Cursor: `#7c6fff`
  - Active Line: `rgba(255,255,255,0.03)`
  - Selection: `rgba(124,111,255,0.25)`
  - Line Numbers: Default `#5a5a72`, Active `#9898b0`
  - Token Colors: Strings (amber/yellow-ish), Keywords (violet), Functions (cyan), Types (green), Numbers (rose), Comments (muted).
- **Editor Options**: I will pass the exact requested configuration object mapped to the Zustand settings store values (font, font size, word wrap, etc.).

## 2. Store Updates (`src/store/editor.ts`)
Update the `FileTab` interface to include new fields:
```typescript
export interface FileTab {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  isDirty: boolean;
  isPinned: boolean;
}
```
Add new actions:
- `updateFileContent(id, newContent)`: Marks file as dirty if content differs from saved state.
- `saveFile(id)`: Marks file as clean.
- `discardFileChanges(id)`: Reverts content and marks as clean.

## 3. Tab System (`src/components/editor/TabBar.tsx`)
- **Structure**: A scrollable flex row (hiding the scrollbar) with optional left/right scroll buttons if overflow occurs.
- **Tab Anatomy**: Language Icon (using Lucide icons or simple colored text based on ext) + Filename + Dirty Dot (`--accent-violet`) + Hover Close Button.
- **Interactions**: 
  - Left click: Make active.
  - Middle click: Close tab.
  - Hover: Reveal close button.
- **Unsaved Close Flow**: Clicking close on a dirty tab replaces the tab text with "Save?" and "Discard?" inline buttons instead of opening a modal.

## 4. TitleBar Breadcrumb
- The `TitleBar` will read the `activeFileId` (path) from the `editor` store.
- It will split the path by `/` and render each segment separated by a muted `/` character.

## 5. Welcome Screen (`src/components/editor/WelcomeScreen.tsx`)
- Rendered conditionally in `EditorArea` when `openFiles.length === 0`.
- **Layout**: Center stage with "NEXUS" in large mono text, a subtitle, two columns (Recent Files, Quick Actions), and a hotkey cheatsheet grid.
- **Background**: Uses a CSS animation with an 8s loop for a very slow, subtle gradient shift using `--bg-base` and a touch of `--bg-overlay` and `--accent-violet-transparent`.

## 6. Editor Context Menu (`src/components/ui/ContextMenu.tsx`)
- Triggered by `onContextMenu` in the `EditorArea` container.
- Prevents default browser menu. Tracks `x` and `y` client coordinates.
- **Design**: `--bg-elevated` (which we will map to `--bg-overlay` with a shadow), `1px --border-default`, `8px` radius. Smooth 80ms opacity/scale entrance animation.
- **Items**: "Fix with AI", "Explain with AI", separators, standard edit actions, and code gen actions.

## 7. File Utility (`src/utils/language.ts`)
- A simple helper function mapping file extensions (`.ts`, `.rs`, `.py`) to Monaco language identifiers (`typescript`, `rust`, `python`, etc.).

## CSS Token Additions
I will add `--bg-surface` and `--bg-elevated` to the themes if they don't explicitly exist, or map them intelligently using `--bg-panel` and `--bg-overlay`.
