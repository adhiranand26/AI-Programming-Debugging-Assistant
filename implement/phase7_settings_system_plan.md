# NEXUS AI - Phase 7 Implementation Plan (Settings & Customization)

## 1. Settings View Architecture (`src/components/layout/SettingsPanel.tsx`)
- **Structure**: A full-screen overlay or a large slide-in panel from the right.
- **State**: Controlled by `activeModal: 'settings'` in the `ui` store.
- **Navigation**: Sidebar with categories mapping to sections in the content area. We'll use `scrollIntoView` for smooth scrolling between sections.

## 2. Store Updates (`src/store/settings.ts`)
We will expand the `SettingsState` to include:
- `uiFont`, `editorFont`, `uiFontSize`, `editorFontSize`, `density`, `accentHue`.
- `editor`: `cursorStyle`, `cursorBlink`, `minimapMode`, `indentGuides`, `whitespaceMode`, `lineNumbersMode`, `tabSize`.
- `ai`: `temperature`, `topP`, `repeatPenalty`, `contextLength`, `fileTypeSystemPrompts: Record<string, string>`.
- `keybindingProfile`, `customKeybindings: string` (JSON string).
- `layoutProfiles: LayoutProfile[]`.

## 3. Appearance Implementation (Task 2)
- **Theme Picker**: We will create a `ThemeCard` component that renders small `div` squares representing the background, panel, accent, and text colors of each theme.
- **Font Previews**: A list of font names rendered with their respective `font-family` styles.
- **Hue Slider**: A range input (0-360). On change, we will convert the HSL hue to Hex/HSL and update the `--accent-violet` CSS variable and store.
- **Density**: Will modify a global `--density-multiplier` variable (e.g., Compact: 0.8, Default: 1, Comfortable: 1.2) that all spacing tokens multiply by.

## 4. AI & Editor Controls (Tasks 3 & 4)
- **Custom Toggle Component**: A premium animated toggle switch (80ms transition) using `--accent-violet`.
- **System Prompts**: A dynamic list where users can add an extension (e.g., `.tsx`) and define a custom system prompt. This will be stored in an object in `settingsStore`.

## 5. Keybindings & Layout Profiles (Tasks 5 & 6)
- **JSON Editor**: A small Monaco instance in the Keybindings section with JSON validation.
- **Layout Profiles**: We will store snapshots of `sidebarWidth`, `aiPanelWidth`, `terminalOpen`, etc. Selecting a profile simply performs a multi-set on the `layout` store.

## 6. VS Code Theme Importer (Task 7)
- **Logic**: A utility function `parseVSCodeTheme(json)` that searches for key color tokens in the `colors` and `tokenColors` objects (e.g., `editor.background`, `activityBar.background`, `syntax.keyword`).
- **Mapping**: It will map these values into our CSS variable format and provide a temporary preview by injecting them into `:root` before the user hits "Save".

## CSS Token Additions
I will add `--density-multiplier` to `globals.css` and use `calc()` for all spacing tokens (e.g., `--spacing-md: calc(16px * var(--density-multiplier))`).
