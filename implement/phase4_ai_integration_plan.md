# NEXUS AI - Phase 4 Implementation Plan (AI Panel & Ollama Streaming)

## 1. Ollama Service Architecture (`src/services/ollama.ts`)
- **`checkConnection()`**: Sends a lightweight `GET` request to `http://localhost:11434/` on app load and via a `setInterval` (every 10s). Updates a global connection state in the Zustand `ui` or `ai` store.
- **`fetchModels()`**: Calls `GET http://localhost:11434/api/tags`. Parses the JSON response to extract an array of model names (`response.models.map(m => m.name)`).
- **`streamChat(params)`**: 
  - Makes a `POST` request to `http://localhost:11434/api/generate` with `{ model, prompt, system, stream: true }`.
  - Uses the native Fetch API `ReadableStream` (`response.body?.getReader()`).
  - Reads chunks, decodes them with `TextDecoder`, and splits by newline to parse each JSON object.
  - Implemented as an `AsyncGenerator` (`yield`ing each chunk's `response` field) to easily iterate through tokens in the React component.
  - Includes `try/catch` logic to specifically detect `Failed to fetch` (Network Error / Offline), HTTP 404 (Model Not Found), and stream aborts, throwing custom errors to be caught by the UI.

## 2. Context Builder (`src/services/contextBuilder.ts`)
- **`buildPrompt(mode, userMessage, activeFile, selection, pinnedFiles)`**:
  - **Code Mode**: Concatenates a rigid system prompt ("You are an expert developer..."), wrapped file contents (` ```language\n{content}\n``` `), the current user selection if any, and any pinned files, ending with the user's specific request.
  - **Chat Mode**: Returns just the `userMessage` without auto-attaching the active file context.
  - **Token Calculation**: Helper function `approximateTokens(text)` returns `Math.ceil(text.length / 4)`. A context usage percentage will be calculated against the active model's context window (assumed 8k for default Llama 3, or dynamically mapped).

## 3. UI Implementation: AI Panel (`src/components/layout/AIPanel.tsx`)
- **Header**: 
  - Left: Cyan dot + "AI".
  - Center: Pill-shaped toggle between "Chat" and "Code".
  - Right: Model switcher dropdown trigger, trash icon (clear history), eye icon (Raw Prompt).
- **Message Area**: 
  - Flex column with `overflow-y-auto`.
  - `MessageBubble` component dynamically styles based on role (`user` vs `assistant`). User bubbles align right with `--bg-elevated`; Assistant bubbles align left with `rgba(0,212,200,0.04)` and `--accent-cyan` bordering.
  - CSS animation for message entrance (`150ms cubic-bezier`).
  - A conditional `ScrollToBottom` button tracks scroll position using a `useRef` on the scroll container.
- **Typing Indicator & Cursor**: 
  - A custom `TypingIndicator` component with 3 staggering CSS-animated dots.
  - A `StreamingCursor` component (`|`) blinking every 530ms appended to the last active message if `isStreaming` is true.

## 4. Markdown & Code Block Rendering
- Since external libraries (like `react-markdown` or `react-syntax-highlighter`) are restricted without permission, I will either:
  1. Parse the AI response manually using a regex to extract code blocks (` ```[\s\S]*?``` `) and render them as custom UI blocks using a read-only `@monaco-editor/react` instance for perfect syntax highlighting.
  2. Provide a Header (language + Copy button) and an "Apply" button (if in Code mode) beneath each code block.

## 5. Input Area & Context Pills
- **Auto-growing Textarea**: Using a hidden `span` or `useRef` scrollHeight measurement to adjust the textarea's `height` from 1 to 6 rows.
- **Context Pills**: Rendered above the textarea. Reads `activeFileId` and `selection` from the editor store to display "filename.tsx" and "L12-L34".
- **Slash Commands**: An `onChange` interceptor checks if the input matches `/fix`, `/explain`, etc., and automatically replaces the input with the expanded prompt text.

## 6. Raw Prompt Viewer & Model Switcher
- **Raw Prompt Viewer**: A drawer overlay within the AIPanel. Displays the raw concatenated string from `contextBuilder`. Allows text editing before final submission.
- **Model Switcher**: A custom dropdown component showing the fetched models array.

## CSS Tokens Additions
I will add `--accent-cyan` (e.g., `#00d4c8`) to our `globals.css` base variables since the PRD heavily references it for AI specific UI elements.
