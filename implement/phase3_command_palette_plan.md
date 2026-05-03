# NEXUS AI - Phase 3 Implementation Plan (Command Palette)

## 1. State Management & Trigger
- **Global Store (`src/store/ui.ts`)**: We already have `commandPaletteOpen` and `setCommandPaletteOpen` in the `ui` slice.
- **Global Keybind Listener (`src/App.tsx`)**: A `useEffect` listening for `keydown` on `window`. If `(e.metaKey || e.ctrlKey) && e.key === 'k'`, prevent default and toggle `setCommandPaletteOpen(true)`.

## 2. Component Architecture (`src/components/ui/CommandPalette.tsx`)
- Will be rendered at the root level of `App.tsx` (or via React Portal) to ensure it sits above everything.
- **Internal State**:
  - `query`: string.
  - `selectedIndex`: number (for keyboard nav).
  - `subPrompt`: null | 'theme' | 'model' | 'font' | 'line' | 'language'.
  - `recentCommands`: string[] (loaded from `localStorage`).
  - `isClosing`: boolean (to trigger close animations before unmounting).

## 3. Visual Design & CSS Animations
- **Backdrop**: `fixed inset-0 z-[200] flex items-center justify-center bg-base/60 backdrop-blur-[20px]`.
- **Modal Container**: `w-[560px] max-h-[400px] bg-elevated rounded-[12px] border border-strong shadow-[0_24px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden flex flex-col`.
- **CSS Animations** (to be added to `globals.css` or Tailwind config):
  - `animate-palette-open`: 120ms `cubic-bezier(0.16, 1, 0.3, 1)` scaling from 0.96 with opacity 0 to 1.
  - `animate-palette-close`: 80ms `cubic-bezier(0.4, 0, 1, 1)` scaling from 1 to 0.97 with opacity 0.

## 4. Fuzzy Search & Match Highlighting
- Instead of just checking `.includes()`, we will implement a simple sequential character match algorithm.
- We will build a helper `HighlightedText` component that takes the label and the query.
- It iterates through the label string. If a character is part of the match, it is rendered in `<span className="text-accent-violet font-medium">`.

## 5. Keyboard Navigation Logic
- **`onKeyDown` handler on the `<input>`**:
  - `ArrowDown`: Increment `selectedIndex` (loop to 0 at end).
  - `ArrowUp`: Decrement `selectedIndex` (loop to max at 0).
  - `Enter`: Find the item at `selectedIndex` in the currently filtered flat list and execute its action.
  - `Tab`: Calculate the indices of section headers and jump `selectedIndex` to the first item of the next section.
  - `Escape`: Trigger close sequence.
- **Auto-scroll**: We will use a `useRef` array for all list items and call `itemRef.current.scrollIntoView({ block: 'nearest' })` when `selectedIndex` changes.

## 6. Command Registration
We will define an array of `Command` objects:
```typescript
interface Command {
  id: string;
  category: 'AI ACTIONS' | 'EDITOR' | 'SETTINGS' | 'FILES';
  label: string;
  icon: React.ElementType; // Lucide icon
  shortcut?: string;
  action: () => void;
  subPromptPlaceholder?: string;
}
```
Actions will execute immediately (e.g., toggling UI state in Zustand) or enter a `subPrompt` state.

## 7. Sub-prompts
- When a command like "Change Theme" is selected, `subPrompt` is set to `'theme'`.
- The `<input>` placeholder changes to "Select theme...".
- A back arrow button appears next to the search icon. Clicking it (or pressing Backspace when query is empty) clears `subPrompt`.
- The results list switches to displaying themes instead of commands.

## CSS Tokens Needed
I will update `globals.css` to ensure `--bg-elevated`, `--border-strong`, and `--border-subtle` are explicitly mapped for all 5 themes.
