# NEXUS AI — Phase 8 Implementation Plan (Final Polish & QA)

This phase produces no new features. It is a systematic audit and refinement pass across every component built in Phases 1–7. The goal: make every pixel, every transition, and every interaction feel like it was placed there by a team that charges $500/hr.

---

## Audit 1 — Animation Consistency

### Approach
I will create a shared animation utilities file (`src/styles/animations.css`) containing all reusable keyframes and a global `prefers-reduced-motion` media query that disables all custom animations.

### Keyframes to Define
```css
/* Entrances — cubic-bezier(0.16, 1, 0.3, 1) */
@keyframes fadeScaleIn   { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
@keyframes fadeSlideUp   { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
@keyframes fadeSlideRight { from { opacity:0; transform:translateX(-8px) } to { opacity:1; transform:translateX(0) } }
@keyframes fadeSlideFromRight { from { opacity:0; transform:translateX(100%) } to { opacity:1; transform:translateX(0) } }

/* Exits — cubic-bezier(0.4, 0, 1, 1) */
@keyframes fadeScaleOut  { from { opacity:1; transform:scale(1) } to { opacity:0; transform:scale(0.97) } }
@keyframes fadeSlideDown { from { opacity:1; transform:translateY(0) } to { opacity:0; transform:translateY(8px) } }
@keyframes fadeSlideToRight { from { opacity:1; transform:translateX(0) } to { opacity:0; transform:translateX(110%) } }

/* Reduced motion override */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Component-by-Component Audit Checklist
| Component | Animation | Duration | Easing | Status |
|---|---|---|---|---|
| Command Palette open | `fadeScaleIn` | 120ms | entrance | To verify |
| Command Palette close | `fadeScaleOut` | 80ms | exit | To verify |
| Tab switch | crossfade (opacity) | 80ms | entrance | To add |
| File tree expand | `fadeSlideUp` on children | 120ms | entrance | To add |
| Terminal panel open | height 0→N + opacity | 180ms | entrance | To verify |
| Terminal panel close | height N→0 + opacity | 150ms | exit | To verify |
| AI message appear | `fadeSlideUp` | 150ms | entrance | To verify |
| Toast slide in | `fadeSlideFromRight` | 180ms | entrance | To build |
| Toast slide out | `fadeSlideToRight` | 120ms | exit | To build |
| Button press | `scale(0.97)` | 60ms | linear | To add |
| Tooltip appear | opacity + `translateY(4px)` | 80ms | entrance | To add |
| Dropdown menus | `fadeScaleIn` | 100ms | entrance | To add |
| Modal overlays | backdrop fade 80ms + `fadeScaleIn` 120ms | — | entrance | To verify |
| Context menu | `fadeScaleIn` | 80ms | entrance | To verify |
| Settings panel slide-in | `fadeSlideRight` or full-width transition | 180ms | entrance | To verify |
| Diff panel slide-up | height transition | 150ms | entrance | To verify |

**Rule**: No animation exceeds 300ms. Most are under 180ms.

---

## Audit 2 — Typography Consistency

### Type Scale (from PRD)
| Token | Font | Size | Weight | Use |
|---|---|---|---|---|
| Title/Logo | JetBrains Mono | 12px | 600 | TitleBar "NEXUS" |
| Section Header | Space Grotesk | 11px | 600 | Sidebar headers, uppercase, tracking 0.12em |
| Body | Space Grotesk | 13px | 400 | All standard UI text |
| Small/Badge | Space Grotesk or JetBrains Mono | 10–11px | 400–500 | StatusBar, badges, pills |
| Code | JetBrains Mono | 14px (configurable) | 400 | Editor, terminal, code blocks |
| Input | Space Grotesk | 13px (command palette: 15px) | 400 | Textareas, inputs |

### Sweep Tasks
- Grep every component for `font-` classes and inline `fontSize` to verify correctness.
- Ensure no component uses `font-sans` (Tailwind default) — only `font-ui` or `font-mono`.
- Verify all uppercase labels have `tracking-wider` or `tracking-[0.12em]`.
- Verify no `font-bold` (700) is used in the UI — max weight should be `font-semibold` (600) for headers and `font-medium` (500) for emphasis.

---

## Audit 3 — Color System Consistency

### Sweep Tasks
- `grep -r '#[0-9a-fA-F]' src/components/` — Every hit outside theme files is a violation to fix.
- Verify layering hierarchy: `--bg-base` (deepest) → `--bg-panel` (sidebars) → `--bg-overlay` (dropdowns, scrollbar tracks) → `--bg-elevated` (modals, toasts) → `--bg-active` (selected items).
- AI-specific elements (chat bubbles, AI header, typing indicator, streaming cursor) must use `--accent-cyan` exclusively — never `--accent-violet`.
- Primary action buttons: `--accent-violet`.
- Destructive actions: `--color-error`. Warnings: `--color-warning`. Success: `--color-success`.

---

## Audit 4 — Micro-Interactions

### Additions to Make
1. **Button press feedback**: Add `active:scale-[0.97] transition-transform duration-[60ms]` to the `Button.tsx` component and all interactive buttons.
2. **Link/icon hover**: Verify all use `transition-colors duration-75` (already present in most Phase 1 components, but must sweep for misses).
3. **Tab close button fade**: The `×` on inactive tabs should have `opacity-0 group-hover:opacity-100 transition-opacity duration-75`.
4. **File tree row hover**: `transition-colors duration-[60ms]` on background.
5. **Input focus ring**: `focus:ring-2 focus:ring-accent-violet/15 focus:border-accent-violet transition-all duration-75`.
6. **Toggle switch animation**: Thumb slides with `transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]`.
7. **Slider thumb scale**: `active:scale-110 transition-transform duration-75`.
8. **Toast progress bar**: A `div` with `width: 100%` that shrinks to `0%` over the auto-dismiss duration using a CSS animation.
9. **Scrollbar hover-only visibility**: Scrollbar thumb starts at `opacity: 0`, parent container `:hover` sets thumb to `opacity: 1` with `transition: opacity 120ms`.

---

## Audit 5 — Empty States

### Components to Add/Verify
| Panel | Empty State Content | Design |
|---|---|---|
| **EditorArea** (no files) | Welcome screen with "NEXUS" logo, subtitle, recent files, quick actions, shortcuts grid | Already built Phase 2 |
| **AIPanel** (no messages) | "Start a conversation" heading + 3 clickable prompt suggestion cards | To build |
| **Sidebar — Files** (no folder) | "Open a folder to get started" + folder icon + "Open Folder" button | To build |
| **Sidebar — Search** (no results) | "No results for '{query}'" + search icon, muted text | To build |
| **Sidebar — Search** (no query) | "Type to search across files" + search icon | To build |
| **Terminal** (closed) | N/A, hidden | Already handled |

### Design Rules for Empty States
- Centered vertically and horizontally within the panel.
- Icon: 32px, `--text-muted` at 50% opacity.
- Heading: 13px `font-medium`, `--text-secondary`.
- Subtext: 12px, `--text-muted`.
- Action button: ghost style, `--accent-violet` text.
- No sparkle emojis. No generic illustrations. Clean and minimal.

---

## Audit 6 — Notification/Toast System (`src/components/ui/Toast.tsx`)

### Architecture
- **Container**: Fixed `bottom-4 right-4 z-[300]`, flex column with `gap-2`, max 3 toasts visible.
- **Toast Component**: 320px wide, `--bg-elevated` background, `1px` border matching the toast type color at 30% opacity, `rounded-[10px]`.
- **Layout**: Icon (left) + message text (center) + optional action button + close `×` (right).
- **Progress Bar**: A 2px `div` at the bottom of the toast, colored to match the type, width animates from 100% to 0% over the auto-dismiss duration.
- **Auto-dismiss Timers**: Info/Success: 3s. Warning: 6s. Error: never (manual close only).
- **Animations**: Entrance `fadeSlideFromRight` 180ms. Exit `fadeSlideToRight` 120ms.
- **Stack Behavior**: New toasts push older ones up. If a 4th toast arrives, the oldest is dismissed.

### Color Mapping
| Type | Icon | Border Color | Progress Color |
|---|---|---|---|
| Info | `Info` (lucide) | `--accent-violet` at 30% | `--accent-violet` |
| Success | `CheckCircle` | `--color-success` at 30% | `--color-success` |
| Warning | `AlertTriangle` | `--color-warning` at 30% | `--color-warning` |
| Error | `XCircle` | `--color-error` at 30% | `--color-error` |

---

## Audit 7 — Loading & Skeleton States

### Skeleton Component (`src/components/ui/Skeleton.tsx`)
- A simple `div` with `--bg-overlay` background and a shimmer animation (a gradient sweep from left to right, 1.5s loop, `ease-in-out`).
- Configurable: `width`, `height`, `borderRadius`.

### Where to Apply
| Context | Loading State |
|---|---|
| Ollama connection (startup) | StatusBar dot pulses between `--text-muted` and `--color-warning` |
| Model list loading | 3 skeleton rows (h-8, rounded-md) in the model picker dropdown |
| AI waiting before stream | Typing indicator (3 dots) — already built in Phase 4 |
| Settings save | Brief "Saved ✓" text fades in near the changed control, auto-fades after 1.5s |

---

## Audit 8 — Keyboard Shortcuts Cheatsheet (`src/components/ui/ShortcutsOverlay.tsx`)

### Trigger
- Press `?` when focus is not inside any `<input>`, `<textarea>`, or Monaco editor.
- Press `?` again or `Escape` to close.

### Design
- Modal overlay: same backdrop styling as Command Palette (blur + 60% opacity base).
- Content: `--bg-elevated`, `rounded-[12px]`, `max-w-[640px]`, `max-h-[480px]`, overflow-y auto.
- Title: "Keyboard Shortcuts" in `font-semibold` 15px.
- Layout: Two-column CSS grid.
- Each row: Action name (`--text-secondary`, 13px) on left, key badge(s) on right.
- Key badge: `--bg-overlay` background, `1px --border-default`, `rounded` (4px), `font-mono text-[11px]`, padding `2px 6px`.

### Sections
| Section | Shortcuts |
|---|---|
| **Navigation** | ⌘K (Command Palette), ⌘P (Quick Open), ⌘, (Settings), ⌘B (Toggle Sidebar), ⌘J (Toggle Terminal) |
| **Editor** | ⌘S (Save), ⌘Z/⌘⇧Z (Undo/Redo), ⌘D (Select Word), ⌘⇧K (Delete Line), ⌘/ (Toggle Comment) |
| **AI** | ⌘⇧F (Fix), ⌘⇧E (Explain), ⌘⇧O (Optimize), ⌘⇧T (Tests), ⌘⇧D (Docs), ⌘⇧R (Refactor) |
| **Terminal** | ⌘J (Toggle), ⌘⇧` (New Terminal) |
| **Settings** | ⌘, (Open Settings), ? (This Cheatsheet) |

---

## Audit 9 — Scrollbar Styling

### Implementation
Update `globals.css` to use hover-only scrollbars:
```css
.scrollable-container {
  overflow-y: auto;
}
.scrollable-container::-webkit-scrollbar-thumb {
  background: transparent;
  transition: background 120ms;
}
.scrollable-container:hover::-webkit-scrollbar-thumb {
  background: var(--bg-overlay);
}
.scrollable-container:hover::-webkit-scrollbar-thumb:hover {
  background: var(--border-default);
}
```
Sweep all scrollable containers (Sidebar, AIPanel message area, Settings content, file tree, command palette results) to ensure they use this pattern.

---

## Audit 10 — Final Visual QA Checklist

This is a manual walkthrough. I will:
1. Kill the dev server and restart fresh to check for white flash.
2. Verify `<link rel="preconnect">` for Google Fonts to prevent FOUT.
3. Check that the `index.html` `<body>` tag has `style="background: #0a0a0c"` as an inline fallback.
4. Navigate every panel, open every dropdown, trigger every animation.
5. Verify icon sizes are uniform (16px for inline, 18px for activity bar).
6. Verify no Tailwind default `text-blue-500` or `bg-white` leaks anywhere.
7. Verify the entire app reads as one cohesive design language.

---

## Execution Order
1. Create `src/styles/animations.css` with all keyframes + reduced-motion query.
2. Build `Toast.tsx` and `Skeleton.tsx` utility components.
3. Build `ShortcutsOverlay.tsx`.
4. Sweep all existing components for typography, color, and animation fixes.
5. Add empty states to AIPanel, Sidebar (files, search).
6. Add micro-interactions (button press, scrollbar visibility, etc.).
7. Update `index.html` with inline dark background and font preconnect.
8. Full visual QA pass.
