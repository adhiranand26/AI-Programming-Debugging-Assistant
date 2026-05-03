# NEXUS AI - Phase 5 Implementation Plan (Diff View & Code Actions)

## 1. Diff View Architecture (`src/components/editor/DiffPanel.tsx`)
- **Location**: Will slide up from the bottom of the `EditorArea`, appearing above (or replacing) the Terminal Panel when active.
- **State Management**: Zustand store (`editor.ts` or `ui.ts`) will track `diffState: { active: boolean, originalContent: string, modifiedContent: string, filename: string } | null`.
- **Component**: 
  - Uses the `<DiffEditor>` component from `@monaco-editor/react`.
  - **Theming**: We will extend our custom `nexus-theme` to override the diff editor specific colors:
    - `diffEditor.removedTextBackground`: `rgba(255, 77, 109, 0.10)`
    - `diffEditor.insertedTextBackground`: `rgba(54, 211, 153, 0.10)`
    - (For the gutter dots, we can inject CSS targeting the `.delete-sign` and `.insert-sign` glyph margins, or configure `renderGutterMenu`).
- **Interactions**:
  - **Apply**: Takes `modifiedContent` and calls `updateFileContent` in the editor store. Fades out panel in 120ms.
  - **Reject**: Fades out panel in 80ms without modifying state.
  - **Keyboard Bindings**: A global `useEffect` when `diffState` is active listening for `Enter` (Apply) and `Escape` (Reject).

## 2. Smart Code Action System
- **Core Logic (`src/lib/codeActions.ts`)**:
  - We will define a `runCodeAction(actionId)` function.
  - It will grab the `activeFile` and the current `selection` (which we need to sync from Monaco to the Zustand store or query directly via an editor ref).
  - It calls `contextBuilder.buildPrompt(...)` using the specialized prompts.
  - It pushes a new user message to the AI store, then starts `streamChat`.
- **Triggers**:
  - **Context Menu / Command Palette**: Already built in Phase 2 & 3, just need to wire them to `runCodeAction()`.
  - **Keyboard Shortcuts**: A global `useEffect` capturing `Cmd+Shift+F`, `Cmd+Shift+E`, etc. We will need to use `e.preventDefault()` to override any browser defaults.
- **Sub-prompt for Convert**: If `actionId === 'CONVERT'`, it triggers the Command Palette's `subPrompt` state for language selection before continuing to `runCodeAction`.
- **Apply Workflow**: When streaming finishes, if the response contains a markdown code block, the `AIPanel` renders an "Apply" button. Clicking this populates the `diffState` and opens the Diff View.

## 3. Pulse Panel (`src/components/layout/PulsePanel.tsx`)
- **Location**: Absolute positioning bottom-right of the `AIPanel`.
- **State**: Needs an `active` state and variables for `tokens`, `startTime`, and `endTime`.
- **Logic**:
  - In `ai.ts`, when `isStreaming` becomes `true`, set `startTime = Date.now()` and reset token count.
  - Each yielded chunk increments token count.
  - A `requestAnimationFrame` loop or `setInterval(..., 100)` updates the "elapsed time" display while `isStreaming` is true.
  - `tokens / sec` = `(tokens / elapsedSeconds).toFixed(1)`.
- **Animation**: 
  - Fades in via Tailwind `transition-opacity duration-150` when `isStreaming` is true.
  - When `isStreaming` becomes false, a `setTimeout` of 2000ms clears the active state and triggers the fade-out.
- **Design**: `--bg-elevated`, `1px solid --border-default`, `8px` radius, mono `10px` text.

## Action & Prompt Mapping Reference
- `FIX`: "Fix the bug or issue in this code. Explain briefly what was wrong and return the corrected code only."
- `EXPLAIN`: "Explain this code clearly. What does it do, how does it work, and are there any important things to know?"
- `OPTIMIZE`: "Optimize this code for performance and readability. Show the improved version with a brief note on changes."
- `GENERATE TESTS`: "Write comprehensive unit tests for this code using the appropriate testing framework. Include edge cases."
- `GENERATE DOCS`: "Write clear JSDoc/docstring comments for this function or module."
- `REFACTOR`: "Refactor this code to be cleaner and more maintainable. Preserve all existing behavior."
- `CONVERT`: "Convert this code to [language]. Maintain equivalent functionality."
- `SECURITY REVIEW`: "Review this code for security vulnerabilities. List any issues found and suggest fixes."
- `PERFORMANCE REVIEW`: "Analyze this code for performance issues. What are the bottlenecks and how to fix them?"
