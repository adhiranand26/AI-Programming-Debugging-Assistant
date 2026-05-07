const { HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType, PageBreak, Paragraph, TextRun, Table, TableRow, TableCell } = require('docx');
const p1 = require('./rpt_part1.cjs');
const { h1, h2, p, bullet, numbered, bold, run, pb, screenshot, code, makeTable } = p1;

// ─── 3. PROBLEM STATEMENT ───
const problemStatement = [
  h1("3. Problem Statement"),
  p("Contemporary AI-powered programming assistants exhibit a critical architectural limitation: their dependence on cloud-based API endpoints for AI inference necessitates persistent internet connectivity and results in the continuous transmission of potentially sensitive source code to remote servers operated by third parties. This constraint renders such tools unsuitable for use cases involving proprietary codebases, classified research environments, examinations, or geographic regions with unreliable internet infrastructure."),
  p("Furthermore, existing tools in this category are typically implemented as editor extensions or browser-based applications that lack the deep integration between the AI conversational interface and the code editing environment necessary for seamless, context-aware assistance. Developers are frequently required to manually copy code snippets between the editor and the AI interface, disrupting the development flow and introducing the risk of context drift."),
  p("A secondary limitation concerns response quality control. Cloud-based APIs, when accessed without careful prompt engineering, produce responses that may be overly verbose, tangentially related to the programming domain, or formatted in ways incompatible with efficient developer consumption. The absence of model configuration transparency in consumer-grade tools further prevents developers from understanding or adjusting the trade-off between response determinism and creative variation."),
  p("The proposed system addresses all of the above deficiencies through the design of a fully local, deeply integrated, prompt-engineered AI programming assistant that operates without any external network dependency, maintains contextual awareness of the active codebase, and delivers technically precise, domain-constrained responses through carefully calibrated model configuration."),
  pb(),
];

// ─── 4. OBJECTIVES ───
const objectives = [
  h1("4. Objectives of the Project"),
  p("The project is guided by the following technical and functional objectives:"),
  bullet("To design and implement a fully offline AI-assisted development environment capable of performing code explanation, bug detection, automated fixing, test generation, and documentation synthesis without any cloud API dependency."),
  bullet("To integrate a local large language model inference backend (Ollama) with a professional-grade code editor (Monaco Editor) to achieve seamless, context-aware AI assistance within a unified interface."),
  bullet("To implement structured prompt engineering techniques that constrain the AI model's domain of operation to software engineering tasks, ensuring domain-relevant, technically precise, and appropriately formatted responses."),
  bullet("To configure model parameters — specifically temperature and top-p — in a manner optimally suited to programming assistance tasks, balancing factual determinism with sufficient expressive flexibility for code generation."),
  bullet("To provide developers with a command palette-driven workflow enabling rapid invocation of AI capabilities without disrupting the coding flow."),
  bullet("To implement a contextual awareness system whereby the AI model automatically receives the relevant file content, selected code region, programming language, and user-specified context as part of each inference request."),
  bullet("To demonstrate an integrated terminal for immediate code execution, enabling developers to test AI-suggested fixes in a single environment."),
  bullet("To ensure that the entire system architecture satisfies the privacy requirement of zero data egress, with all computation remaining on the developer's local hardware."),
  pb(),
];

// ─── 5. PROPOSED SYSTEM ───
const proposedSystem = [
  h1("5. Proposed System and Methodology"),
  h2("5.1 System Overview"),
  p("The proposed system is a local-first AI-augmented Integrated Development Environment designated Nexus AI. It is implemented as a desktop web application using React 19 with Vite as the build system, enabling fast hot-reload during development and optimized production bundles. The application does not require a backend server of its own; all persistent storage is handled via browser localStorage and IndexedDB, and all AI inference is delegated to the Ollama process running on the same machine via its REST API exposed at localhost:11434."),
  p("The system architecture is organized into five principal subsystems: the code editing environment (Monaco Editor), the AI inference pipeline (Ollama REST API with streaming), the conversational AI panel, the command palette, and the integrated terminal (xterm.js). These subsystems are orchestrated through a centralized Zustand state management layer that maintains synchronization between the editor state, the AI context, and the user interface configuration."),
  h2("5.2 Methodology"),
  p("The development methodology follows a systems integration approach in which each subsystem is first constructed and validated in isolation before being integrated with adjacent components. The AI inference pipeline is implemented using the browser's native Fetch API with ReadableStream, enabling token-by-token streaming of model responses directly into the conversational UI without blocking the main JavaScript thread."),
  p("Prompt engineering is employed as the primary mechanism of domain control. A structured system prompt is constructed for each AI request that specifies the model's role, constrains its response domain, mandates specific formatting conventions (such as fenced code blocks with explicit language identifiers), and injects the relevant code context derived from the user's current editor state."),
  p("The command palette serves as the primary user-facing interface for AI capability invocation. It is implemented as a modal search interface triggered by a keyboard shortcut, presenting a categorized list of AI actions (fix, explain, optimize, generate tests, generate documentation) that the user can filter and select. Upon selection, the system assembles the appropriate prompt, dispatches it to the Ollama API, and streams the response into the AI panel."),
  p("Diff-based code application is implemented for AI-generated code suggestions. When the model returns modified code, the system presents a split-view comparison between the original and proposed code, allowing the developer to review the changes before applying them to the editor with a single keystroke."),
  pb(),
];

// ─── 6. SYSTEM ARCHITECTURE ───
const architecture = [
  h1("6. System Architecture"),
  p("The overall system architecture of the AI Programming and Debugging Assistant is organized as a layered client-side application with a local AI inference backend. The architecture comprises three principal tiers: the Presentation Tier, the Application Logic Tier, and the AI Inference Tier."),
  h2("6.1 Presentation Tier"),
  p("The presentation tier encompasses all user-facing interface components rendered within the browser window. The primary layout is organized as a four-panel arrangement: an Activity Bar on the extreme left providing navigation between functional views; a Sidebar Panel hosting the file tree, workspace search, and source control status; the central Editor Pane containing the Monaco code editor and the integrated xterm.js terminal; and the AI Panel on the right hosting the conversational interface and context management controls."),
  h2("6.2 Application Logic Tier"),
  p("The application logic tier is implemented in React and managed through Zustand. It is responsible for maintaining the application state (open files, editor configuration, AI conversation history, panel sizes, theme settings), coordinating the assembly of AI prompts from editor context, dispatching inference requests to the Ollama API, and processing streaming responses for display in the AI panel. The command palette module occupies a central position in this tier, translating user-selected actions into parameterized prompt templates that are then submitted to the inference pipeline."),
  h2("6.3 AI Inference Tier"),
  p("The AI inference tier consists entirely of the Ollama process running as a local service on the developer's machine. Ollama manages the loading and lifecycle of quantized LLMs from its local model library, exposes a REST API compatible with the OpenAI message format, and handles GPU/CPU scheduling for inference. The application communicates with Ollama exclusively via HTTP POST requests to the /api/chat endpoint, with the stream parameter set to true to enable Server-Sent Events-style token streaming. No data traverses any external network boundary at any point in this tier."),
  screenshot("System Architecture Diagram — four-panel IDE layout with Ollama inference backend"),
  pb(),
];

// ─── 7. DATA FLOW ───
const dataFlow = [
  h1("7. Data Flow"),
  p("The end-to-end data flow for a representative AI assistance request proceeds through the following sequential stages:"),
  numbered("The developer opens a source file in the Monaco Editor. The file content is loaded into the editor buffer and the active language mode is auto-detected from the file extension."),
  numbered("The developer selects a region of code and invokes an AI action through the Command Palette, a right-click context menu, or a slash command in the AI panel input."),
  numbered("The Action Dispatcher module retrieves the current editor state from Zustand, including the file name, programming language, selected text, cursor position, and any pinned file contents."),
  numbered("The Prompt Assembler constructs a structured messages array conforming to the Ollama /api/chat request format containing a system message and user message with code context."),
  numbered("The assembled request payload is submitted to the Ollama API endpoint (http://localhost:11434/api/chat) via a streaming HTTP POST request."),
  numbered("Ollama receives the request, loads the specified model into memory if not already resident, and begins inference. Tokens are serialized into newline-delimited JSON objects."),
  numbered("The Streaming Response Handler reads the response body as a ReadableStream, parsing each chunk and appending delta text to the AI panel's message buffer."),
  numbered("If the AI response contains a fenced code block, the Diff Computation Module extracts the proposed code, compares it with the original, and renders the result in the Diff Viewer."),
  numbered("Upon application of accepted changes, the Monaco Editor API replaces the original text selection with the AI-proposed code."),
  screenshot("Data Flow Diagram — end-to-end request lifecycle"),
  pb(),
];

// ─── 8. TECHNOLOGIES USED ───
const technologies = [
  h1("8. Technologies Used"),
  h2("8.1 React 19 and Vite"),
  p("React is a declarative JavaScript library for constructing user interfaces through a component-based model. In this project, React is used to implement all UI components — including the editor panel, AI panel, command palette, sidebar, and status bar — as reusable, composable units. Vite serves as the build system, providing near-instantaneous hot module replacement during development and highly optimized production bundles via Rollup."),
  h2("8.2 Monaco Editor"),
  p("Monaco Editor is the open-source code editor engine that powers Visual Studio Code. It provides syntax highlighting for over one hundred languages, code folding, multi-cursor editing, IntelliSense-style completions, go-to-definition navigation, find-and-replace with regex support, and a rich programmatic API. In this project, Monaco is configured with a custom dark theme, JetBrains Mono as the editor typeface, and smooth cursor animation."),
  h2("8.3 Ollama"),
  p("Ollama is a local LLM inference framework that manages the downloading, storage, and serving of open-weight language models on consumer hardware. It exposes a REST API compatible with the OpenAI chat completions format. Ollama handles model quantization (typically to 4-bit or 8-bit precision) automatically, making large models such as LLaMA 3 (8B parameters) accessible on hardware with as little as 8 GB of RAM. The streaming response capability is central to the real-time token display in the AI panel."),
  h2("8.4 Zustand"),
  p("Zustand is a minimal, unopinionated state management library for React applications. In this project, Zustand manages the open file list, active file and tab state, editor configuration, AI conversation history, panel dimensions, and theme settings. State slices related to panel sizes and theme are persisted to localStorage through Zustand's persist middleware."),
  h2("8.5 xterm.js"),
  p("xterm.js is a full-featured terminal emulator implemented in JavaScript, the same terminal engine used in Visual Studio Code's integrated terminal. It renders terminal output including ANSI escape sequences, colors, and cursor control with high fidelity. In this project, xterm.js is lazily loaded and its visual theme is configured to match the application color system."),
  h2("8.6 Tailwind CSS"),
  p("Tailwind CSS is a utility-first CSS framework that enables rapid styling through composition of single-purpose utility classes. The design system for this project — including a custom color palette, typographic scale, and spacing system — is defined in the Tailwind configuration and applied throughout the component tree."),
  pb(),
];

module.exports = { problemStatement, objectives, proposedSystem, architecture, dataFlow, technologies };
