<p align="center">
  <img src="public/favicon.svg" width="80" alt="NEXUS AI Logo" />
</p>

<h1 align="center">NEXUS AI</h1>

<p align="center">
  <strong>Local-first AI coding environment. Your code stays on your machine.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/typescript-6-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/ollama-local_LLMs-000000?style=flat-square" alt="Ollama" />
  <img src="https://img.shields.io/badge/license-MIT-22c55e?style=flat-square" alt="License" />
</p>

---

NEXUS AI is a browser-based IDE built for developers who want AI assistance without sending their code to the cloud. It connects to local LLMs via [Ollama](https://ollama.com) and supports remote providers (OpenAI, Anthropic, Google Gemini, OpenRouter) when you need them. Everything runs in your browser — zero backend required.

> **This is not a wrapper around ChatGPT.** NEXUS AI is a full development environment with a Monaco editor, terminal emulator, file management, diff viewer, and a deeply integrated AI assistant — all in one interface.

---

## ✨ Features

| Feature | Description |
|---|---|
| **AI Assistant Panel** | Streaming chat with context-aware code analysis. Supports both local and remote models. |
| **Monaco Editor** | Full VS Code editing experience — syntax highlighting, IntelliSense, multi-tab, minimap. |
| **Local-First AI** | Connect to Ollama and run models like `llama3`, `mistral`, `codellama` entirely on your machine. |
| **Multi-Provider Support** | Switch between Ollama, OpenAI, Anthropic, Google Gemini, OpenRouter, or any custom endpoint. |
| **Inline Diff Viewer** | AI-generated code suggestions render as side-by-side diffs you can accept or reject. |
| **Command Palette** | `⌘+Shift+P` — fuzzy-search actions, toggle panels, switch themes, navigate files. |
| **Integrated Terminal** | xterm.js-powered terminal panel with fit-to-container and web links support. |
| **Theming Engine** | Ships with 5 editor themes (Sovereign, Nord, Catppuccin, Rosé Pine, Obsidian) + VS Code theme importer. |
| **Settings System** | Full GUI for editor config, AI parameters, density, accent colors, and keybinding profiles. |

---

## 🧠 How It Works

```
┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│  NEXUS AI    │────▶│  Ollama API    │────▶│  Local LLM   │
│  (Browser)   │     │  localhost:11434│     │  (llama3)    │
└──────────────┘     └────────────────┘     └──────────────┘
       │
       │  (optional)
       ▼
┌────────────────────┐
│  Remote API        │
│  OpenAI / Anthropic│
│  Gemini / Custom   │
└────────────────────┘
```

Your code context (active file, selection, file tree) is assembled into a structured prompt and streamed to the selected model. Responses render in real-time as Markdown with syntax-highlighted code blocks. Code blocks include one-click **Copy** and **Diff** actions.

No server. No database. State persists in `localStorage` via Zustand.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 18
- [Ollama](https://ollama.com) (for local models)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/adhiranand26/AI-Programming-Debugging-Assistant.git
cd AI-Programming-Debugging-Assistant

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🤖 Model Setup (Ollama)

NEXUS AI uses Ollama to run LLMs locally. No API keys, no cloud, no data leaving your machine.

### 1. Install Ollama

```bash
# macOS
brew install ollama

# Or download from https://ollama.com/download
```

### 2. Pull a Model

```bash
ollama pull llama3
```

Other recommended models:

```bash
ollama pull codellama       # Optimized for code
ollama pull mistral         # Fast general-purpose
ollama pull deepseek-coder  # Strong at code generation
```

### 3. Start the Server

```bash
ollama serve
```

NEXUS AI will automatically detect the running Ollama instance and populate the model selector.

### Remote Providers (Optional)

Open **Settings → AI Configuration → Remote Models** to add API keys for:

- **OpenAI** — GPT-4o, GPT-4-turbo
- **Anthropic** — Claude 3.5 Sonnet, Claude 3 Opus
- **Google Gemini** — Gemini Pro, Gemini Flash
- **OpenRouter** — Access 100+ models through a single key
- **Custom Endpoint** — Any OpenAI-compatible API

> ⚠️ API keys are stored in your browser's `localStorage`. They never leave your machine, but treat them accordingly.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── editor/          # Monaco editor, tab bar, diff panel, welcome screen
│   ├── layout/          # AI panel, sidebar, activity bar, status bar, terminal
│   └── ui/              # Command palette, context menu, toast, shortcuts overlay
├── services/
│   ├── aiProvider.ts    # Unified streaming for Ollama + OpenAI + Anthropic + Gemini
│   ├── ollama.ts        # Direct Ollama API client
│   └── contextBuilder.ts# Prompt assembly from editor context
├── store/               # Zustand stores (ai, editor, layout, settings, terminal, ui)
├── styles/              # Global CSS tokens, animations
├── themes/              # Editor themes (Sovereign, Nord, Catppuccin, etc.)
├── lib/                 # Monaco code actions
└── utils/               # Language detection utilities
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript 6 |
| **Bundler** | Vite 8 |
| **Editor** | Monaco Editor (`@monaco-editor/react`) |
| **State** | Zustand (persisted to localStorage) |
| **Styling** | Tailwind CSS 3 + custom CSS variables |
| **Terminal** | xterm.js + fit addon |
| **Icons** | Lucide React |
| **AI Runtime** | Ollama (local) / OpenAI, Anthropic, Google APIs (remote) |

---

## 🛠 Roadmap

- [ ] **Multi-file context** — Include multiple files in AI prompts
- [ ] **Plugin system** — Extend NEXUS with community plugins
- [ ] **Git integration** — Stage, commit, diff from the sidebar
- [ ] **Collaborative editing** — Real-time pair programming
- [ ] **Cloud sync** — Optional encrypted settings sync
- [ ] **RAG pipeline** — Index entire codebases for deeper AI context

---

## 📸 Screenshots

> Screenshots coming soon. Run `npm run dev` to see it live.

<!-- 
![NEXUS AI — Editor](screenshots/editor.png)
![NEXUS AI — AI Panel](screenshots/ai-panel.png)
![NEXUS AI — Settings](screenshots/settings.png)
-->

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘ + Shift + P` | Command Palette |
| `⌘ + ,` | Settings |
| `⌘ + B` | Toggle Sidebar |
| `⌘ + J` | Toggle Terminal |
| `⌘ + L` | Toggle AI Panel |
| `⌘ + /` | Shortcuts Reference |

---

## 🧑‍💻 Author

**Adhi Ranand**  
GitHub: [@adhiranand26](https://github.com/adhiranand26)

---

## 📄 License

MIT — use it, fork it, build on it.
