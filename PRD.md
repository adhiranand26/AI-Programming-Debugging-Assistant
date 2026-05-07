Got it. Here's the full PRD as clean text you can paste directly into your AI agent.

---

# NEXUS AI — SOVEREIGN EDITION
## Complete Frontend & Product PRD for AI Agent

---

## WHAT YOU ARE BUILDING

A local-first AI-powered IDE called Nexus AI. It runs entirely offline using Ollama as the AI backend and Monaco as the code editor. The product is built with React + Vite + Tailwind + Zustand. The design must feel like a real premium developer tool — not a student project, not generic AI slop. Think Raycast meets Linear meets a terminal. Fast, sharp, opinionated.

---

## TECH STACK

- React + Vite
- Tailwind CSS (utility only, no component libraries)
- Zustand for state management
- Monaco Editor (@monaco-editor/react)
- Ollama REST API (http://localhost:11434)
- xterm.js for integrated terminal
- JetBrains Mono for editor font
- Space Grotesk or Geist for UI font (NOT Inter, NOT Roboto)

---

## DESIGN SYSTEM

### Colors
```
--bg-base: #09090b         // deepest background
--bg-surface: #0f0f12      // panels
--bg-elevated: #141418     // cards, blocks
--bg-overlay: #1c1c22      // hover states, dropdowns
--border-subtle: rgba(255,255,255,0.07)
--border-default: rgba(255,255,255,0.11)
--border-strong: rgba(255,255,255,0.18)
--text-primary: #e8e8f0
--text-secondary: #9898b0
--text-muted: #5a5a72
--accent-violet: #7c6fff   // primary actions, focus rings
--accent-violet-light: #a89fff
--accent-cyan: #00d4c8     // AI-related elements only
--accent-cyan-light: #4de8e0
--amber: #f5a623           // warnings
--red: #ff4d6d             // errors, danger
--green: #36d399           // success, connected
```

### Typography
- UI font: Space Grotesk or Geist (load from Google Fonts or bundle)
- Editor font: JetBrains Mono (editor only)
- Mono UI font: JetBrains Mono for labels, tags, shortcuts, status bar
- Never use Inter, Roboto, Arial, system-ui as primary font
- Font size scale: 10px labels, 11px mono tags, 12px small body, 13px body, 14px default, 20px section titles, 42px hero
- Line height: 1.7 for body, 1.2 for headings, 1.8 for code
- Letter spacing: -0.02em on headings, +0.1em on uppercase labels

### Spacing
- Base unit: 4px
- Component padding: 16px, 20px, 24px
- Section padding: 48px
- Gap between cards: 12px

### Border radius
- Small elements (tags, badges): 4px
- Buttons, inputs: 6px
- Cards, panels: 10px
- Large containers: 14px
- Pills: 999px

---

## LAYOUT STRUCTURE

```
┌─────────────────────────────────────────────────────┐
│  TITLEBAR — window controls + file name + ⌘K + model status │
├────┬────────────┬──────────────────────┬─────────────┤
│    │            │    TAB BAR           │             │
│ A  │  SIDEBAR   ├──────────────────────┤  AI PANEL   │
│ C  │  (file     │                      │             │
│ T  │  tree /    │   MONACO EDITOR      │  (chat +    │
│ I  │  search /  │                      │   code      │
│ V  │  git /     │                      │   actions)  │
│ I  │  outline)  │                      │             │
│ T  │            │                      │             │
│ Y  │            ├──────────────────────┤             │
│    │            │   TERMINAL PANEL     │             │
│ B  │            │   (xterm.js)         │             │
│ A  │            │                      │             │
│ R  │            │                      │             │
├────┴────────────┴──────────────────────┴─────────────┤
│  STATUS BAR — language, line:col, encoding, model, connection │
└─────────────────────────────────────────────────────┘
```

### Panel behavior
- Every panel border is draggable to resize
- Double-click border to fully collapse a panel
- Sidebar default width: 220px, min 160px, max 400px
- AI panel default width: 280px, min 220px, max 500px
- Terminal panel default height: 200px, min 100px, max 60% of window height
- All panel sizes persist to localStorage

### Activity bar (far left, 44px wide)
Icons for: Files, Search, Git (lightweight), Extensions/Themes, Settings. Bottom: User preferences icon. Active icon has violet background tint. Clicking switches sidebar panel content.

---

## TITLEBAR

- Height: 38px
- Background: slightly lighter than base (#0f0f12)
- Left: window traffic lights (macOS style dots) + app name "NEXUS"
- Center: current file path as breadcrumb (src > components > Button.tsx)
- Right: ⌘K command palette trigger button + AI mode toggle (Chat / Code) + Ollama connection dot (green = connected, red = disconnected)
- Font: mono, 11px, letter-spacing 0.05em

---

## TAB BAR

- Height: 34px
- Background: same as sidebar (#0f0f12), border-bottom 1px
- Tabs: 13px, Space Grotesk, padding 0 16px
- Active tab: bg-base background, no bottom border, slightly lighter text
- Inactive tab: text-muted, hover reveals close button
- Dirty indicator: small dot before filename when unsaved changes
- Pinned tabs: lock icon, stays leftmost
- Middle-click closes tab
- Tab overflow: arrow buttons to scroll, no wrapping

---

## SIDEBAR / FILE TREE

- File type icons using a devicons or vscode-icons style set (different icon per extension)
- Folder chevrons animate open/close (80ms ease)
- Active file row: violet tint background
- Hover: subtle bg-overlay background shift
- Indent guides: thin vertical lines (border-subtle color) showing nesting depth
- Right-click context menu: New File, New Folder, Rename, Delete, Copy Path, Copy Relative Path
- Unsaved dot shown next to filename if file has changes
- Search tab: full fuzzy search across workspace (like VS Code Ctrl+Shift+F)
- Git tab: shows changed files, staged files, diff indicator per file

---

## MONACO EDITOR SETUP

### Visual config
- Font: JetBrains Mono, 14px, line height 1.8
- Theme: custom dark theme matching the design system colors (NOT default dark+ or monokai — build a custom one)
- Background: #09090b
- Active line highlight: rgba(255,255,255,0.03) — very subtle
- Selection color: rgba(124,111,255,0.25)
- Cursor: smooth animation, violet color (#7c6fff)
- Matching bracket highlight: soft glow
- Indent guides: visible, subtle
- Minimap: enabled but collapsed by default, toggle in status bar
- Scrollbar: thin (8px), styled to match theme, no track background
- Gutter: slightly wider than default, line numbers text-muted

### Editor features to enable
- Format on save (Prettier via Monaco)
- Auto bracket closing
- Auto indentation
- Code folding
- Multiple cursors (Ctrl+D, Alt+click)
- Column selection (Alt+Shift+drag)
- Find and Replace (Ctrl+H)
- Go to line (Ctrl+G)
- Symbol search (Ctrl+Shift+O)
- Smooth cursor animation (cursorSmoothCaretAnimation: true)
- Cursor blinking: smooth
- Language auto-detection from file extension

---

## STATUS BAR

Height: 24px. Background: slightly darker than base. Font: JetBrains Mono, 9-10px. Color: text-muted. All items clickable.

Left side items:
- Git branch indicator (branch icon + name)
- Error/warning count (red dot + number, orange dot + number)

Right side items:
- Current line : column
- File encoding (UTF-8)
- Line ending (LF / CRLF) — click to change
- Language mode — click to change
- Spaces/Tabs indicator — click to change indent
- Word count (shown for markdown files)
- Active model name (e.g. llama3)
- Ollama connection status dot

---

## COMMAND PALETTE (⌘K)

This is the most important UI element. Get this right.

### Appearance
- Centered modal, NOT a sidebar
- Width: 560px, max-height: 400px
- Background: bg-elevated with strong backdrop blur (blur(20px))
- Border: 1px border-strong
- Border radius: 12px
- Box shadow: 0 24px 80px rgba(0,0,0,0.6)
- Overlay: bg-base at 60% opacity behind it
- Opens with a very fast scale + fade animation (80ms, cubic-bezier(0.16, 1, 0.3, 1))

### Input
- Full-width text input at top, 48px tall
- No border on input itself — the modal is the border
- 16px left padding, search icon
- Font: Space Grotesk, 15px
- Placeholder: "Type a command or search files..."
- Cursor: violet

### Results
- Grouped by category: Recent, Files, AI Actions, Editor Actions, Settings
- Category headers: mono 10px, text-muted, uppercase, letter-spacing 0.1em
- Each result row: 36px tall, icon + label + right-side shortcut hint
- Active row: bg-overlay background, violet left border 2px
- Keyboard navigation: arrow keys, Enter to execute, Escape to close
- Match characters highlighted in violet
- Recent commands shown before user types anything (last 10)

### Commands to include
- fix this / fix selected code
- explain this / explain selected code
- optimize this
- refactor this
- generate unit tests
- generate docstring
- convert to [language]
- open file...
- search in files
- toggle terminal
- toggle AI panel
- change model
- change theme
- open settings
- format document
- go to line

---

## AI PANEL

### Layout
- Header: 34px, border-bottom, shows "AI" label + mode toggle (Chat | Code) + clear button + model name
- Body: scrollable message list
- Footer: textarea input + send button + context indicator

### Message design
- User messages: right-aligned, bg-elevated background, border-default border, border-radius 10px 10px 2px 10px
- AI messages: left-aligned, subtle cyan tint (rgba(0,212,200,0.05) background, rgba(0,212,200,0.12) border)
- Small model avatar/icon on AI messages
- Timestamp: mono 10px, text-muted, shown on hover
- Streaming: text appears token by token with a blinking cursor at the end
- Typing indicator: three dots animation before streaming starts (scale bounce, 400ms each, staggered)

### Code blocks inside AI responses
- Full syntax highlighting matching editor theme
- Copy button top-right, appears on hover
- Language label top-left (mono 10px)
- Apply button for code suggestions (opens diff view)
- Background slightly lighter than message background

### Context indicator
Shows what context is currently attached: current file name, selected lines range, pinned files. Small pills above the input. Clickable to remove.

### Input
- Auto-growing textarea, min 1 line, max 6 lines
- Ctrl+Enter to send, Enter for newline
- Drag and drop files onto panel to add as context
- Slash commands: /fix, /explain, /test, /doc, /convert

### Modes
- Chat mode: general conversation, no automatic file context
- Code mode: automatically attaches current file + selection as context

---

## DIFF VIEW

When AI suggests code changes:
- Split view: old code (left/top, red tint lines) and new code (right/bottom, green tint lines)
- Line-level diff, not character-level
- Removed lines: rgba(255,77,109,0.12) background, red gutter dot
- Added lines: rgba(54,211,153,0.12) background, green gutter dot
- Two action buttons: "Apply" (green) and "Reject" (red/ghost)
- Apply merges the new code into the editor with a smooth 150ms transition
- Reject closes the diff view with a fade out
- Keyboard: Tab to toggle between apply/reject, Enter to confirm

---

## INTEGRATED TERMINAL (xterm.js)

- Full xterm.js integration, not a fake terminal
- Font: JetBrains Mono, 13px
- Theme: matches the color system (bg-base background, text-primary foreground)
- Multiple terminal tabs (+ button to add, × to close)
- Split terminal: button to split pane horizontally
- Toolbar: terminal name (editable), split, add, close, clear buttons
- Run current file button: detects language, runs appropriate command (python file.py, node file.js, etc.)
- Ctrl+R reverse search history
- Scrollback: 5000 lines

---

## ANIMATIONS — FULL SPECIFICATION

This section is critical. All animations must feel buttery, intentional, and fast. Nothing should feel slow or bouncy.

### Timing function
- Default easing: cubic-bezier(0.16, 1, 0.3, 1) — fast start, smooth end. Use this everywhere.
- For exits: cubic-bezier(0.4, 0, 1, 1) — quick fade out
- Never use linear for UI transitions
- Never use bounce or elastic easing

### Duration rules
- Instant feedback (hover states, active states): 80ms
- Fast transitions (tab switch, panel toggle, tooltip appear): 120ms
- Standard transitions (modal open, panel resize snap, diff appear): 180ms
- Deliberate transitions (page-level changes, welcome screen): 250ms
- NEVER exceed 300ms for any UI animation
- Always respect prefers-reduced-motion — wrap all animations in the media query

### Specific animations

**Command palette open:**
- Scale from 0.96 to 1.0 + opacity 0 to 1
- Duration: 120ms
- Easing: cubic-bezier(0.16, 1, 0.3, 1)
- Overlay fades in simultaneously at 80ms

**Command palette close:**
- Scale to 0.97 + opacity to 0
- Duration: 80ms
- Easing: cubic-bezier(0.4, 0, 1, 1)

**Tab switch:**
- Crossfade editor content: opacity transition 80ms
- Tab active indicator slides (not jumps) to new position: 120ms

**Sidebar panel switch (Files → Search → Git):**
- Content fades out at 60ms, new content fades in at 80ms
- Panel width animates if different: 150ms

**File tree item expand/collapse:**
- Chevron rotates 90deg: 80ms
- Children slide down (height 0 → auto via max-height trick): 120ms

**Panel resize:**
- Real-time, no animation — follows cursor exactly
- Snap to collapsed: 150ms spring

**AI message appear:**
- Fade in + translateY(6px → 0): 150ms, staggered 30ms from previous message

**AI streaming cursor:**
- Blinking caret: opacity 0 ↔ 1, 530ms interval, only while streaming

**Typing indicator (3 dots):**
- Each dot scales 1 → 1.4 → 1: 400ms, staggered 120ms between dots
- Loop indefinitely until streaming starts

**Diff view appear:**
- Lines animate in from opacity 0, staggered 8ms per line
- Apply/Reject buttons slide up from 8px below: 150ms

**Button press:**
- Scale to 0.97 on mousedown: 60ms
- Return to 1.0 on mouseup: 80ms

**Tooltip appear:**
- Fade in + translateY(3px → 0): 80ms delay 300ms

**Error shake:**
- translateX: 0 → -4px → 4px → -2px → 2px → 0: 300ms total

**Notification/toast slide in:**
- SlideInRight + fade: 180ms from right edge
- Auto-dismiss after 3s with fade out 120ms

**Focus ring:**
- Box shadow 0 0 0 0 → 0 0 0 2px accent-violet: 80ms

**Active line in editor:**
- Background fades in at 60ms when cursor moves to line

**Skeleton loading:**
- Gradient sweep animation left to right: 1.5s loop
- Background: linear-gradient(90deg, bg-elevated, bg-overlay, bg-elevated)

---

## RICEABILITY SYSTEM

This is a first-class feature. Users can deeply customize the editor and the settings persist.

### Theme system
- 5 built-in themes minimum:
  - **Sovereign** (default): deep dark, violet + cyan accents as described above
  - **Obsidian**: pure black #000000 base, pure white accents, no color — brutalist minimal
  - **Nord**: cool blue-gray palette, arctic vibe
  - **Rosé Pine**: warm dark, muted rose and gold accents
  - **Catppuccin Mocha**: the popular pastel dark theme

- Custom theme via JSON import: user can paste a VS Code theme JSON, it gets parsed and applied to both Monaco and the UI
- Theme applies to: editor, UI chrome, terminal, AI panel — everything
- Theme switcher in settings and as a command palette command
- Theme preview on hover before applying

### Font customization
- UI font: picker with at least 6 options (Space Grotesk, Geist, Outfit, Plus Jakarta Sans, DM Sans, IBM Plex Sans)
- Editor font: picker with at least 8 options (JetBrains Mono, Fira Code, Cascadia Code, Geist Mono, Inconsolata, Source Code Pro, Hack, Monaspace Neon)
- Font size sliders: UI (11–16px), Editor (11–20px)
- Line height slider: editor (1.4–2.2)
- Font ligatures toggle (for fonts that support them)

### Layout density
- Three modes: Compact, Default, Comfortable
- Changes padding, line heights, tab sizes, panel header heights throughout

### Editor customization
- Cursor style: block / line / underline
- Cursor blink: on / off / smooth / phase / expand
- Minimap: on / off / always / on-hover
- Indent guides: on / off
- Render whitespace: none / boundary / all
- Line numbers: on / off / relative (Vim style)
- Word wrap: on / off / column

### Keybinding profiles
- Default (Nexus)
- VS Code compatible
- Vim mode (Monaco has this built in)
- Emacs mode (Monaco has this)
- User can remap any shortcut via a keybindings JSON editor

### Panel layout
- Save current panel layout as a named workspace profile
- Switch between profiles instantly
- At least 3 defaults: Coding (sidebar + editor + terminal), Focus (editor only), Review (editor + AI panel large)

### Accent color picker
- User can change the primary accent from violet to any color
- Secondary accent (cyan, AI-related) changes proportionally
- Live preview as they drag the hue slider

---

## POWER USER FEATURES

### Multi-file context (pinning)
- Pin icon on each file in the file tree
- Pinned files appear as context pills above AI input
- AI automatically includes pinned file contents in every request
- Max 5 pinned files (token limit awareness)
- Context window usage bar shows how full the model's context is

### Raw prompt viewer
- Eye icon in AI panel header
- Opens a drawer showing the exact prompt being sent to Ollama
- User can edit the prompt before sending
- Shows system prompt, context, and user message separately

### Prompt templates
- Saved prompts with variable placeholders: {file}, {selection}, {language}
- Accessible from command palette or slash commands
- User can create, edit, delete templates
- Built-in templates: Fix, Explain, Test, Document, Convert, Review Security, Review Performance

### AI response rating
- Thumbs up / thumbs down on each AI message
- Saves rating to local session log
- No telemetry — stays on device

### Session export
- Export entire chat session as markdown or HTML
- Includes code blocks, diffs, file names

### "What did I build today" summary
- Button in AI panel or command palette
- Summarizes all AI interactions in current session as a changelog
- e.g. "Fixed authentication bug in auth.ts, Created login API endpoint, Wrote unit tests for UserService"

### Response caching
- If same prompt + same context is sent twice, return cached result instantly
- Cache stored in memory (not persisted, resets on reload)
- Cache indicator shown on repeated results

### Model management
- Model switcher in titlebar dropdown
- Shows all locally available Ollama models
- Model parameters panel: temperature, top_p, repeat_penalty, context length sliders
- Per-filetype system prompts: different behavior when editing Python vs JS vs markdown

### TODO tracker
- Scan all open files for TODO, FIXME, HACK comments
- List them in a panel (accessible from activity bar)
- Click jumps to that line
- Filter by type (TODO / FIXME / HACK)

### Code complexity indicator
- Show a subtle badge on function names in the gutter (or on hover) indicating complexity: low (green dot), medium (amber dot), high (red dot)
- Based on cyclomatic complexity approximation (line count + nesting depth as rough proxy)

---

## WELCOME SCREEN

Shown when no file is open. Not a blank panel.

- Nexus logo (text-based, not image)
- Recent files list (last 10, with file type icon + relative time)
- Quick actions: Open File, Open Folder, New File, Clone Git Repo
- Keyboard shortcut cheatsheet (most important ones)
- Active model + connection status
- Theme preview strip showing current theme name
- Subtle animated background (very slow moving gradient or noise — not distracting)

---

## NOTIFICATIONS / TOASTS

- Bottom-right corner stack
- Max 3 visible at once, older ones push up
- Types: info (violet), success (green), warning (amber), error (red)
- Each has: icon + message + optional action button + dismiss ×
- Auto-dismiss: 3s for info/success, 6s for warning, stays for error
- All animations as specified in animation section

---

## SETTINGS PAGE

Full settings page accessible from activity bar or ⌘, shortcut.

Sections:
- Appearance (theme, font, density, accent color)
- Editor (cursor, indent, minimap, whitespace, word wrap, ligatures)
- AI (model, parameters, system prompts per filetype, context behavior, caching)
- Keybindings (keybinding profile + custom remaps via JSON editor)
- Terminal (font, font size, shell path, scrollback)
- Workspace (auto-save delay, format on save, file associations)
- Riceability (layout profiles, panel defaults)

All settings saved to localStorage and reload on startup.

---

## PERFORMANCE RULES

- Never block the main thread during AI streaming
- Editor must feel instant — Monaco interactions never wait for AI
- Use Web Workers for any heavy processing (file search, complexity analysis)
- Virtualize long lists (file tree, AI messages if long, search results)
- Lazy load the terminal (xterm.js) until first opened
- Code split Monaco from the main bundle
- All Ollama API calls use streaming (fetch with ReadableStream)
- Skeleton loaders for anything that takes > 100ms to appear

---

## THINGS YOU DO NOT BUILD

Do not build any of these no matter what. They will destroy the timeline.

- Full Git integration (commits, push, pull) — only read-only git status display
- Plugin marketplace or plugin system
- Full repository AI indexing
- Real-time ghost autocomplete (tab-triggered AI suggestions are fine, inline-as-you-type is not)
- Cloud sync of any kind
- Authentication system
- Multi-user or collaboration features
- Voice input
- Agent mode / autonomous code execution
- Mobile or tablet layout

---

## DEMO FLOW (what this must be able to do flawlessly)

1. Open a file with a bug → press ⌘K → type "fix this" → see diff view → press Apply
2. Highlight a function → right-click → Explain → AI explains only that block in the panel
3. Turn off WiFi → repeat any AI action → everything still works (offline flex)
4. Change theme live from command palette — full UI + editor updates instantly
5. Open terminal → run the fixed file → see output

---

## FINAL NOTES FOR THE AGENT

The most important thing is that the editor feels right. If Monaco indentation is off, if bracket closing doesn't work, if the cursor feels laggy — a power user will notice in 10 seconds and lose trust in the whole product. Fix the editor feel before adding features.

The second most important thing is the animation system. Every transition must use the specified easing curves and durations. Nothing slow. Nothing bouncy. Fast and smooth.

The third most important thing is no generic AI slop aesthetics. No purple gradient hero sections. No rounded blob shapes. No "AI sparkle" icons everywhere. The design is a dark developer tool — sharp, dense, typographic, fast.