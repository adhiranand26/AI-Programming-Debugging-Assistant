# NEXUS AI - Phase 6 Implementation Plan (Terminal Integration)

## 1. Terminal Panel Architecture (`src/components/terminal/TerminalPanel.tsx`)
- We will replace the placeholder `TerminalPanel` created in Phase 1 with a fully featured multi-tab xterm.js implementation.
- **State Management**: Create a new Zustand store slice (`terminal.ts`) or add to `layout.ts`:
  - `terminals: TerminalTab[]` (id, title, instance reference).
  - `activeTerminalId: string`.
  - Actions: `addTerminal`, `closeTerminal`, `renameTerminal`.

## 2. xterm.js Configuration
- Instantiation options mapping to our design system:
  - `background: '#09090b'`
  - `foreground: '#e8e8f0'`
  - `cursor: '#7c6fff'`
  - `selectionBackground: 'rgba(124, 111, 255, 0.25)'`
  - Plus standard ANSI color mappings.
  - `fontFamily: 'JetBrains Mono'`, `fontSize` from Settings Store.
  - `scrollback: 5000`.
- **Addons**: Load `FitAddon` and `WebLinksAddon`.
- **Lifecycle**: We will use a `useLayoutEffect` or `useEffect` to instantiate the xterm instance, attach it to a `useRef` container, and call `fitAddon.fit()`.

## 3. Terminal Header UI
- **Left side**: Flex row of terminal tabs.
  - Active tab styling: `--accent-violet` bottom border (2px), `--text-primary`.
  - Inactive tab styling: `--text-muted`.
  - A subtle `+` button to spawn new terminals.
- **Right side**: Icons for "Clear" (calls `term.clear()`), "Split" (future support), and "Close Panel" (sets `terminalOpen: false`).

## 4. Animation & Resizing
- **Animation**: The container `div` will have CSS classes:
  - `transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)]`.
  - When `terminalOpen` is true: `h-[var(--terminal-height)] opacity-100`.
  - When `terminalOpen` is false: `h-0 opacity-0 pointer-events-none`.
- **Resize Flow**: 
  - The `ResizableBorder` updates `terminalHeight` in the store.
  - A `useEffect` in `TerminalPanel` listens for `terminalHeight` changes and calls `fitAddon.fit()` to instantly reflow the text matrix.

## 5. "Run Current File" Feature
- We will add a "Run" button in the Editor's title area or the Terminal toolbar.
- **Logic**:
  - Grab `activeFile` from the editor store.
  - Extract the file extension.
  - Map extension to runner command:
    - `.py` → `python3 ${path}`
    - `.js` → `node ${path}`
    - `.ts` → `npx ts-node ${path}`
    - `.go` → `go run ${path}`
    - `.rs` → `cargo run
    - `.sh` → `bash ${path}`
  - Focus the active xterm instance and send the command text followed by `\r` (carriage return) using `term.write(command + '\r')` or native shell IPC if a backend is wired up.
