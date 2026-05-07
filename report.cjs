const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, LevelFormat, BorderStyle, WidthType,
  ShadingType, PageBreak, VerticalAlign, TableOfContents
} = require('docx');
const fs = require('fs');

const BORDER_COLOR = "2C3E7A";
const ACCENT = "1A3A6B";
const LIGHT_BG = "EEF2FA";
const HEADING_COLOR = "1A3A6B";
const SUBHEADING_COLOR = "2E5FAA";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h(text, level = HeadingLevel.HEADING_1, color = HEADING_COLOR) {
  const sizes = { HEADING_1: 28, HEADING_2: 24, HEADING_3: 22 };
  const sz = sizes[level] || 24;
  return new Paragraph({
    heading: level,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: sz, color, font: "Arial" })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 120, line: 360 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, size: 22, font: "Arial", ...opts })]
  });
}

function bullet(text, ref = "bullets") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}

function numbered(text) {
  return bullet(text, "numbers");
}

function bold(text) { return new TextRun({ text, bold: true, size: 22, font: "Arial" }); }
function run(text) { return new TextRun({ text, size: 22, font: "Arial" }); }

function mixedPara(runs, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 120, line: 360 },
    alignment: AlignmentType.JUSTIFIED,
    children: runs,
    ...opts
  });
}

function sectionDivider(label) {
  return new Paragraph({
    spacing: { before: 320, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR, space: 1 } },
    children: [new TextRun({ text: label, bold: true, size: 28, color: HEADING_COLOR, font: "Arial", allCaps: true })]
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function tableRow2(label, value, shade = false) {
  const bg = shade ? LIGHT_BG : "FFFFFF";
  return new TableRow({
    children: [
      new TableCell({
        borders, width: { size: 3000, type: WidthType.DXA },
        shading: { fill: bg, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [bold(label)] })]
      }),
      new TableCell({
        borders, width: { size: 6360, type: WidthType.DXA },
        shading: { fill: bg, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [run(value)] })]
      })
    ]
  });
}

function makeTable2(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3000, 6360],
    rows: rows.map((r, i) => tableRow2(r[0], r[1], i % 2 === 0))
  });
}

function placeholderBox(label) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: {
      top: { style: BorderStyle.DASHED, size: 4, color: "999999" },
      bottom: { style: BorderStyle.DASHED, size: 4, color: "999999" },
      left: { style: BorderStyle.DASHED, size: 4, color: "999999" },
      right: { style: BorderStyle.DASHED, size: 4, color: "999999" }
    },
    children: [new TextRun({ text: `[ SCREENSHOT PLACEHOLDER: ${label} ]`, size: 20, color: "888888", italics: true, font: "Arial" })]
  });
}

function codeBlock(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    shading: { fill: "F4F4F4", type: ShadingType.CLEAR },
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "1A1A1A" })]
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: HEADING_COLOR },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: SUBHEADING_COLOR },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: "333333" },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 }
      },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 }
      }
    },
    children: [

      // ─── COVER PAGE ───
      new Paragraph({
        spacing: { before: 480 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Chandigarh University", bold: true, size: 36, font: "Arial", color: HEADING_COLOR })]
      }),
      new Paragraph({
        spacing: { before: 100, after: 40 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Department of Computer Science and Engineering", size: 24, font: "Arial", color: "444444" })]
      }),
      new Paragraph({
        spacing: { before: 20, after: 280 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Course: INT428 — Domain-Specific Generative AI Chatbot", size: 22, font: "Arial", color: "555555", italics: true })]
      }),

      new Paragraph({
        spacing: { before: 280, after: 40 }, alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 8, color: BORDER_COLOR } },
        children: []
      }),

      new Paragraph({
        spacing: { before: 120, after: 60 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "PROJECT REPORT", bold: true, size: 28, font: "Arial", color: "666666", allCaps: true, characterSpacing: 40 })]
      }),

      new Paragraph({
        spacing: { before: 40, after: 160 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "AI-Powered Programming and Debugging Assistant", bold: true, size: 40, font: "Arial", color: HEADING_COLOR })]
      }),

      new Paragraph({
        spacing: { before: 40, after: 320 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "A Local-First, Offline-Capable Intelligent IDE for Code Assistance, Debugging, and Explanation", size: 22, font: "Arial", color: "555555", italics: true })]
      }),

      new Paragraph({
        spacing: { before: 120, after: 40 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Submitted by", size: 22, font: "Arial", color: "666666" })]
      }),
      new Paragraph({
        spacing: { before: 20, after: 20 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Adhira Nand", bold: true, size: 26, font: "Arial", color: HEADING_COLOR })]
      }),
      new Paragraph({
        spacing: { before: 10, after: 10 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Roll Number: ____________________", size: 22, font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 10, after: 10 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Branch & Semester: ____________________", size: 22, font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 10, after: 200 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Guide / Faculty: ____________________", size: 22, font: "Arial" })]
      }),

      new Paragraph({
        spacing: { before: 80, after: 40 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Academic Year: 2024–25", size: 20, font: "Arial", color: "777777" })]
      }),
      new Paragraph({
        spacing: { before: 10, after: 10 }, alignment: AlignmentType.CENTER,
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BORDER_COLOR } },
        children: []
      }),

      pageBreak(),

      // ─── TABLE OF CONTENTS ───
      new Paragraph({
        spacing: { before: 40, after: 20 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "TABLE OF CONTENTS", bold: true, size: 28, font: "Arial", color: HEADING_COLOR, allCaps: true, characterSpacing: 30 })]
      }),
      new Paragraph({ spacing: { before: 0, after: 240 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR } }, children: [] }),

      ...[
        ["1.", "Abstract", "3"],
        ["2.", "Introduction", "4"],
        ["3.", "Problem Statement", "5"],
        ["4.", "Objectives of the Project", "5"],
        ["5.", "Proposed System and Methodology", "6"],
        ["6.", "System Architecture", "7"],
        ["7.", "Data Flow", "8"],
        ["8.", "Technologies Used", "9"],
        ["9.", "Model Details and Configuration", "11"],
        ["10.", "Prompt Engineering", "12"],
        ["11.", "Implementation and Working", "13"],
        ["12.", "Results and Sample Outputs", "14"],
        ["13.", "Advantages", "16"],
        ["14.", "Limitations", "16"],
        ["15.", "Future Scope", "17"],
        ["16.", "Conclusion", "17"],
        ["", "References", "18"],
      ].map(([num, title, pg]) =>
        new Paragraph({
          spacing: { before: 60, after: 60 },
          tabStops: [{ type: "right", position: 9000, leader: "dot" }],
          children: [
            new TextRun({ text: `${num}   ${title}`, size: 22, font: "Arial" }),
            new TextRun({ text: "\t" + pg, size: 22, font: "Arial" })
          ]
        })
      ),

      pageBreak(),

      // ─── 1. ABSTRACT ───
      h("1. Abstract"),
      p("The rapid proliferation of generative artificial intelligence has opened unprecedented avenues for domain-specific intelligent assistance. This report presents the design, architecture, and implementation of an AI-Powered Programming and Debugging Assistant — a local-first, offline-capable development environment that integrates a large language model (LLM) backend with a professional-grade code editor interface. Unlike cloud-dependent AI coding tools, the proposed system leverages Ollama as its AI inference engine, enabling all model computations to occur entirely on the user's local machine without transmitting code or queries to any remote server."),
      p("The system incorporates a Monaco-based code editor, an AI conversational panel, an integrated terminal, and a command palette — collectively forming a unified intelligent development environment (IDE). Key functionalities include contextual code explanation, automated bug detection and fixing, unit test generation, documentation synthesis, and language-aware response control. The assistant is engineered with carefully configured model parameters — specifically temperature and top-p — to ensure technically precise, deterministic, and domain-constrained outputs suitable for a software engineering context."),
      p("Prompt engineering constitutes a central pillar of the system, with a structured system prompt that assigns the model a strict role, constrains its domain of operation, and governs response formatting. The results demonstrate that the system reliably assists programmers with debugging, code review, and explanation tasks across multiple programming languages, achieving consistently accurate and readable outputs. The project contributes to the growing field of privacy-preserving AI developer tools by demonstrating the viability of fully offline, LLM-augmented integrated development environments."),

      pageBreak(),

      // ─── 2. INTRODUCTION ───
      h("2. Introduction"),
      h("2.1 Background of AI in Coding Assistants", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The integration of artificial intelligence into software development workflows has undergone a fundamental transformation over the past several years. From early rule-based linters and static analysis tools, the field has progressed to large language model (LLM)-based systems capable of generating, explaining, refactoring, and debugging code with a degree of contextual understanding previously unattainable through automated means. Pioneering systems such as GitHub Copilot, Amazon CodeWhisperer, and Tabnine introduced developers to the concept of AI pair programming, wherein intelligent suggestions are surfaced inline within the editing environment."),
      p("These systems, while demonstrably effective, share a common architectural dependency: they route all user queries and code snippets to remote cloud-based inference infrastructure. This model raises significant concerns regarding intellectual property confidentiality, data sovereignty, and operational resilience in environments with limited or unreliable network connectivity. The emergence of high-quality open-weight language models — such as LLaMA 3, Mistral, and DeepSeek Coder — combined with efficient local inference frameworks like Ollama, has made it technically and economically feasible to operate AI coding assistants entirely within a developer's local compute environment."),
      h("2.2 Importance of Privacy and Local AI", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Privacy considerations in AI-assisted development are of paramount importance, particularly in enterprise and educational settings. Proprietary code, credentials inadvertently embedded within source files, and sensitive algorithmic logic represent categories of data that developers and organizations are rightfully reluctant to transmit to external servers. Furthermore, academic institutions often operate within strict regulatory frameworks governing student data, which may prohibit the use of cloud-based AI APIs without explicit institutional agreements."),
      p("Local AI inference addresses these concerns holistically. By confining all model computation to the developer's own hardware, the system eliminates network latency as a source of jitter, removes dependency on third-party API availability, and ensures that no user-generated data ever traverses an external network boundary. The resulting tool is not merely a privacy-preserving variant of existing cloud-based solutions; it represents a qualitatively different product category — one where offline functionality, instant responsiveness, and user autonomy are first-class design requirements rather than optional features."),
      p("This project operationalizes these principles by constructing a complete, production-quality AI-assisted IDE that runs entirely on the local machine, delivering the capabilities of state-of-the-art AI coding assistants without any of the associated privacy trade-offs."),

      pageBreak(),

      // ─── 3. PROBLEM STATEMENT ───
      h("3. Problem Statement"),
      p("Contemporary AI-powered programming assistants exhibit a critical architectural limitation: their dependence on cloud-based API endpoints for AI inference necessitates persistent internet connectivity and results in the continuous transmission of potentially sensitive source code to remote servers operated by third parties. This constraint renders such tools unsuitable for use cases involving proprietary codebases, classified research environments, examinations, or geographic regions with unreliable internet infrastructure."),
      p("Furthermore, existing tools in this category are typically implemented as editor extensions or browser-based applications that lack the deep integration between the AI conversational interface and the code editing environment necessary for seamless, context-aware assistance. Developers are frequently required to manually copy code snippets between the editor and the AI interface, disrupting the development flow and introducing the risk of context drift between what the developer is viewing and what the AI is processing."),
      p("A secondary limitation concerns response quality control. Cloud-based APIs, when accessed without careful prompt engineering, produce responses that may be overly verbose, tangentially related to the programming domain, or formatted in ways incompatible with efficient developer consumption. The absence of model configuration transparency in consumer-grade tools further prevents developers from understanding or adjusting the trade-off between response determinism and creative variation."),
      p("The proposed system addresses all of the above deficiencies through the design of a fully local, deeply integrated, prompt-engineered AI programming assistant that operates without any external network dependency, maintains contextual awareness of the active codebase, and delivers technically precise, domain-constrained responses through carefully calibrated model configuration."),

      // ─── 4. OBJECTIVES ───
      h("4. Objectives of the Project"),
      p("The project is guided by the following technical and functional objectives:"),
      bullet("To design and implement a fully offline AI-assisted development environment capable of performing code explanation, bug detection, automated fixing, test generation, and documentation synthesis without any cloud API dependency."),
      bullet("To integrate a local large language model inference backend (Ollama) with a professional-grade code editor (Monaco Editor) to achieve seamless, context-aware AI assistance within a unified interface."),
      bullet("To implement structured prompt engineering techniques that constrain the AI model's domain of operation to software engineering tasks, ensuring domain-relevant, technically precise, and appropriately formatted responses."),
      bullet("To configure model parameters — specifically temperature and top-p — in a manner optimally suited to programming assistance tasks, balancing factual determinism with sufficient expressive flexibility for code generation."),
      bullet("To provide developers with a command palette-driven workflow enabling rapid invocation of AI capabilities without disrupting the coding flow."),
      bullet("To implement a contextual awareness system whereby the AI model automatically receives the relevant file content, selected code region, programming language, and user-specified context as part of each inference request."),
      bullet("To demonstrate an integrated terminal for immediate code execution, enabling developers to test AI-suggested fixes in a single environment."),
      bullet("To ensure that the entire system architecture satisfies the privacy requirement of zero data egress, with all computation remaining on the developer's local hardware."),

      pageBreak(),

      // ─── 5. PROPOSED SYSTEM / METHODOLOGY ───
      h("5. Proposed System and Methodology"),
      h("5.1 System Overview", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The proposed system is a local-first AI-augmented Integrated Development Environment designated Nexus AI. It is implemented as a desktop web application using React with Vite as the build system, enabling fast hot-reload during development and optimized production bundles. The application does not require a backend server of its own; all persistent storage is handled via browser localStorage, and all AI inference is delegated to the Ollama process running on the same machine via its REST API exposed at localhost:11434."),
      p("The system architecture is organized into five principal subsystems: the code editing environment (Monaco Editor), the AI inference pipeline (Ollama REST API with streaming), the conversational AI panel, the command palette, and the integrated terminal (xterm.js). These subsystems are orchestrated through a centralized Zustand state management layer that maintains synchronization between the editor state, the AI context, and the user interface configuration."),
      h("5.2 Methodology", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The development methodology follows a systems integration approach in which each subsystem is first constructed and validated in isolation before being integrated with adjacent components. The AI inference pipeline is implemented using the browser's native Fetch API with ReadableStream, enabling token-by-token streaming of model responses directly into the conversational UI without blocking the main JavaScript thread."),
      p("Prompt engineering is employed as the primary mechanism of domain control. A structured system prompt is constructed for each AI request that specifies the model's role, constrains its response domain, mandates specific formatting conventions (such as fenced code blocks with explicit language identifiers), and injects the relevant code context derived from the user's current editor state. This prompt is assembled programmatically from a template in which dynamic fields — including the programming language, file name, selected code, and cursor position — are substituted at request time."),
      p("The command palette serves as the primary user-facing interface for AI capability invocation. It is implemented as a modal search interface triggered by a keyboard shortcut, presenting a categorized list of AI actions (fix, explain, optimize, generate tests, generate documentation) that the user can filter and select. Upon selection, the system assembles the appropriate prompt, dispatches it to the Ollama API, and streams the response into the AI panel."),
      p("Diff-based code application is implemented for AI-generated code suggestions. When the model returns modified code, the system presents a split-view comparison between the original and proposed code, allowing the developer to review the changes before applying them to the editor with a single keystroke."),

      pageBreak(),

      // ─── 6. SYSTEM ARCHITECTURE ───
      h("6. System Architecture"),
      p("The overall system architecture of the AI Programming and Debugging Assistant is organized as a layered client-side application with a local AI inference backend. The architecture comprises three principal tiers: the Presentation Tier, the Application Logic Tier, and the AI Inference Tier, each of which is described below."),
      h("6.1 Presentation Tier", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The presentation tier encompasses all user-facing interface components rendered within the browser window. The primary layout is organized as a four-panel arrangement: an Activity Bar on the extreme left providing navigation between functional views; a Sidebar Panel hosting the file tree, workspace search, and source control status; the central Editor Pane containing the Monaco code editor and the integrated xterm.js terminal; and the AI Panel on the right hosting the conversational interface and context management controls. A Titlebar at the top displays the current file path, model status, and the command palette trigger. A Status Bar at the bottom surfaces contextual information including the active language, line and column position, model name, and Ollama connection status."),
      h("6.2 Application Logic Tier", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The application logic tier is implemented in React and managed through Zustand. It is responsible for maintaining the application state (open files, editor configuration, AI conversation history, panel sizes, theme settings), coordinating the assembly of AI prompts from editor context, dispatching inference requests to the Ollama API, and processing streaming responses for display in the AI panel. The command palette module occupies a central position in this tier, translating user-selected actions into parameterized prompt templates that are then submitted to the inference pipeline. A diff computation module compares AI-proposed code with the original editor content and generates a structured diff representation consumed by the diff viewer component."),
      h("6.3 AI Inference Tier", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The AI inference tier consists entirely of the Ollama process running as a local service on the developer's machine. Ollama manages the loading and lifecycle of quantized LLMs from its local model library, exposes a REST API compatible with the OpenAI message format, and handles GPU/CPU scheduling for inference. The application communicates with Ollama exclusively via HTTP POST requests to the /api/chat endpoint, with the stream parameter set to true to enable Server-Sent Events-style token streaming. No data traverses any external network boundary at any point in this tier."),
      new Paragraph({ spacing: { before: 160, after: 80 }, children: [new TextRun({ text: "Architecture Diagram:", bold: true, size: 22, font: "Arial" })] }),
      placeholderBox("System Architecture Diagram — four-panel IDE layout with Ollama inference backend"),

      pageBreak(),

      // ─── 7. DATA FLOW ───
      h("7. Data Flow"),
      p("The end-to-end data flow for a representative AI assistance request proceeds through the following sequential stages:"),
      numbered("The developer opens a source file in the Monaco Editor. The file content is loaded into the editor buffer and the active language mode is auto-detected from the file extension. The filename and language are registered in the Zustand application state."),
      numbered("The developer selects a region of code (or leaves no selection, in which case the entire visible file content is used) and invokes an AI action, either through the Command Palette (⌘K), a right-click context menu, or a slash command in the AI panel input."),
      numbered("The Action Dispatcher module retrieves the current editor state from Zustand, including the file name, programming language, selected text, cursor position, and any pinned file contents designated as additional context."),
      numbered("The Prompt Assembler constructs a structured messages array conforming to the Ollama /api/chat request format. This array contains a system message (the domain-constraining system prompt), optionally one or more context messages (for pinned files), and the user message encoding the specific AI action request along with the code context."),
      numbered("The assembled request payload is submitted to the Ollama API endpoint (http://localhost:11434/api/chat) via a streaming HTTP POST request. The model, temperature, top_p, and max_tokens parameters are included in the request body."),
      numbered("Ollama receives the request, loads the specified model into memory if not already resident, and begins inference. As tokens are generated, they are serialized into newline-delimited JSON objects and written to the HTTP response stream."),
      numbered("The application's Streaming Response Handler reads the response body as a ReadableStream, parsing each newline-delimited chunk as a JSON object and extracting the delta text from the content field. Each delta is appended to the AI panel's current message buffer, producing the characteristic token-by-token streaming display."),
      numbered("If the AI response contains a fenced code block identified as a code suggestion, the Diff Computation Module extracts the proposed code, compares it with the original editor selection using a line-level diff algorithm, and renders the result in the Diff Viewer component. The developer can then apply or reject the proposed changes."),
      numbered("Upon application of accepted changes, the Monaco Editor API is invoked to replace the original text selection with the AI-proposed code, and the diff viewer is dismissed. The developer may immediately test the applied changes using the integrated terminal."),
      placeholderBox("Data Flow Diagram — end-to-end request lifecycle from user action to AI response to editor update"),

      pageBreak(),

      // ─── 8. TECHNOLOGIES USED ───
      h("8. Technologies Used"),
      h("8.1 React and Vite", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("React is a declarative JavaScript library for constructing user interfaces through a component-based model. In this project, React is used to implement all UI components — including the editor panel, AI panel, command palette, sidebar, and status bar — as reusable, composable units. Vite serves as the build system, providing near-instantaneous hot module replacement during development and highly optimized production bundles via Rollup. Vite's code-splitting capabilities are exploited to defer the loading of the Monaco Editor and xterm.js bundles until they are first required, reducing initial page load time."),
      h("8.2 Monaco Editor", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Monaco Editor is the open-source code editor engine that powers Visual Studio Code. It provides a comprehensive set of editing features including syntax highlighting for over one hundred languages, code folding, multi-cursor editing, IntelliSense-style completions, go-to-definition navigation, find-and-replace with regular expression support, and a rich programmatic API for reading and manipulating editor state. In this project, Monaco is configured with a custom dark theme derived from the application's design system, JetBrains Mono as the editor typeface, and smooth cursor animation to match the visual quality of professional development tools."),
      h("8.3 Ollama", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Ollama is a local LLM inference framework that manages the downloading, storage, and serving of open-weight language models on consumer hardware. It exposes a REST API compatible with the OpenAI chat completions format, enabling straightforward integration with existing tooling. Ollama handles model quantization (typically to 4-bit or 8-bit precision) automatically, making large models such as LLaMA 3 (8B parameters) or DeepSeek Coder accessible on hardware with as little as 8 GB of RAM. The streaming response capability of the Ollama API is central to the real-time token display in the AI panel."),
      h("8.4 Zustand", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Zustand is a minimal, unopinionated state management library for React applications. Unlike the Redux ecosystem, Zustand does not require boilerplate reducers or action creators; state is defined as a single store object with updater functions, and components subscribe to specific slices of state to trigger re-renders only when relevant data changes. In this project, Zustand manages the open file list, active file and tab state, editor configuration, AI conversation history, panel dimensions, and theme settings. State slices related to panel sizes and theme are persisted to localStorage through Zustand's persist middleware."),
      h("8.5 xterm.js", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("xterm.js is a full-featured terminal emulator implemented in JavaScript, the same terminal engine used in Visual Studio Code's integrated terminal. It renders terminal output including ANSI escape sequences, colors, and cursor control with high fidelity, and supports multiple terminal sessions within a tabbed interface. In this project, xterm.js is lazily loaded and initialized only when the terminal panel is first opened, and its visual theme is configured to match the application color system."),
      h("8.6 Tailwind CSS", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Tailwind CSS is a utility-first CSS framework that enables rapid styling through composition of single-purpose utility classes directly in component markup. Unlike traditional component libraries, Tailwind imposes no pre-built component styles, giving full visual control over every element. The design system for this project — including a custom color palette, typographic scale, and spacing system — is defined in the Tailwind configuration and applied through utility classes throughout the component tree."),

      pageBreak(),

      // ─── 9. MODEL DETAILS ───
      h("9. Model Details and Configuration"),
      h("9.1 Model Selection", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The primary model used in this project is LLaMA 3 (8B parameters), accessed through Ollama under the model identifier llama3. LLaMA 3 is Meta's third generation open-weight large language model, trained on over fifteen trillion tokens of multilingual text with a strong representation of code in Python, JavaScript, TypeScript, C, C++, Java, Go, and Rust. Its 8-billion parameter variant achieves a balance between inference speed on consumer hardware and the level of code comprehension required for the intended use cases. On a machine equipped with a contemporary GPU with 8 GB of VRAM, LLaMA 3 8B delivers inference latency of approximately 40–70 tokens per second, yielding a perceptibly fluid streaming display in the AI panel. For users with more capable hardware, DeepSeek Coder V2 (16B parameters) is additionally supported as an alternative model, offering improved code-specific performance at the cost of higher memory and computational requirements."),
      h("9.2 Model Parameters", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The model is configured with the following parameters, which are submitted with each inference request:"),
      makeTable2([
        ["Parameter", "Value"],
        ["Model", "llama3 (LLaMA 3 8B via Ollama)"],
        ["Temperature", "0.2"],
        ["Top-p (Nucleus Sampling)", "0.85"],
        ["Max Output Tokens", "2048"],
        ["Context Length", "8192 tokens"],
        ["Repeat Penalty", "1.1"],
        ["Stop Sequences", "User:, Human:"],
      ]),
      new Paragraph({ spacing: { before: 120 }, children: [] }),
      h("9.3 Parameter Justification", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The temperature value of 0.2 is selected deliberately to prioritize factual accuracy and determinism in model responses. Programming assistance tasks — particularly bug fixing and code explanation — demand responses that are technically correct rather than creatively varied. A temperature approaching zero would cause the model to always select the single highest-probability token at each step, producing maximally deterministic but potentially stilted output. The value of 0.2 introduces a small degree of token sampling diversity sufficient to produce fluent prose in explanations while maintaining the technical precision required for code generation."),
      p("The top-p value of 0.85 implements nucleus sampling, confining token selection to the smallest set of candidates whose cumulative probability mass reaches 85%. This effectively excludes low-probability tokens — which in the context of code generation frequently correspond to syntactically or semantically incorrect constructs — from the sampling pool, while preserving enough vocabulary breadth to generate readable and varied explanations. The combination of temperature 0.2 and top-p 0.85 is empirically well-suited to technical domains where factual accuracy dominates over expressive variety."),
      p("The repeat penalty of 1.1 discourages the model from repeating phrases or code constructs, which is particularly relevant in code generation contexts where the model might otherwise produce redundant or circular logic. The context length of 8192 tokens ensures that even moderately large source files can be provided as context without truncation."),

      pageBreak(),

      // ─── 10. PROMPT ENGINEERING ───
      h("10. Prompt Engineering"),
      h("10.1 System Prompt Design", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The system prompt is the foundational mechanism through which the model's role, domain, and behavioral constraints are established. It is submitted as the first message in the messages array with the role field set to system. The system prompt employed in this project is reproduced below:"),
      codeBlock("You are an expert software engineering assistant specialized in code analysis, debugging,"),
      codeBlock("and programming education. You operate as the AI backend of a local integrated development"),
      codeBlock("environment. Your responses must adhere strictly to the following constraints:"),
      codeBlock(""),
      codeBlock("DOMAIN: Restrict all responses to topics directly related to software development,"),
      codeBlock("programming languages, debugging, algorithms, data structures, software architecture,"),
      codeBlock("development tools, and computer science concepts. Do not engage with topics outside"),
      codeBlock("this domain regardless of user instruction."),
      codeBlock(""),
      codeBlock("FORMAT: When providing code, always use fenced code blocks with the correct language"),
      codeBlock("identifier (e.g., ```python, ```javascript). Provide clear, numbered explanations"),
      codeBlock("for complex concepts. Keep responses concise and directly actionable."),
      codeBlock(""),
      codeBlock("ACCURACY: Prioritize technical correctness above all other considerations. If you are"),
      codeBlock("uncertain about a detail, state the uncertainty explicitly rather than speculating."),
      codeBlock(""),
      codeBlock("CONTEXT: The user's active file, programming language, and selected code will be"),
      codeBlock("provided in each request. Always ground your response in the specific code provided."),
      h("10.2 Context Injection", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Beyond the system prompt, each inference request dynamically injects contextual information derived from the editor state. This context is assembled into a structured user message prefix that precedes the actual user query. The context block includes the programming language of the active file (enabling the model to apply language-specific idioms and conventions), the filename and path (relevant for import resolution suggestions), the complete content of the active file or the user-selected code region, and the contents of any pinned files the user has designated as persistent context."),
      h("10.3 Response Control and Domain Restriction", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Domain restriction is enforced through the explicit system prompt instruction limiting responses to software engineering topics. Additionally, the prompt templates for specific actions (fix, explain, test, document) are structured to elicit highly specific response patterns. For example, the fix action prompt instructs the model to first identify the specific bug present in the code, then provide the corrected code in a fenced block, and finally explain the root cause of the bug in two to three sentences. This structured elicitation approach consistently produces responses in the expected format, facilitating programmatic extraction of code blocks for the diff viewer."),

      pageBreak(),

      // ─── 11. IMPLEMENTATION ───
      h("11. Implementation and Working"),
      h("11.1 Launch and Initial State", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Upon application launch, the system checks the Ollama connection status by dispatching a lightweight GET request to the /api/tags endpoint. A green status indicator in the titlebar confirms that Ollama is running and responsive. The welcome screen presents recent files, quick action buttons, and the active model name. The developer opens a source file through the file tree or the command palette, which loads the file content into the Monaco Editor and registers the file in the tab bar."),
      h("11.2 Invoking AI Assistance", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The developer invokes AI assistance by pressing the Command Palette shortcut, which opens a centered modal search interface. Typing a partial command (such as 'fix' or 'explain') filters the available actions. Upon selection of an action, the modal closes, the AI panel becomes visible if hidden, and a loading indicator appears in the panel while the prompt is being assembled and the first tokens begin streaming from Ollama."),
      h("11.3 Reviewing and Applying Suggestions", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("When the AI response includes a code suggestion, the system automatically detects the fenced code block, computes a line-level diff against the original editor content, and presents the diff view within the AI panel. Lines proposed for removal are highlighted with a red tint and a deletion indicator in the gutter; lines proposed for addition are highlighted with a green tint and an addition indicator. The developer presses Apply to merge the suggestion into the editor, or Reject to dismiss it. The application of accepted changes is performed via the Monaco Editor's executeEdits API, which integrates the change into the editor's undo history."),
      h("11.4 Terminal Validation", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Following the application of an AI fix, the developer can immediately validate the corrected code by opening the integrated terminal and executing the file. The terminal panel provides a Run button that detects the programming language of the active file and executes the appropriate runtime command. The complete output of the execution — including any remaining error messages — is displayed in the terminal, providing immediate feedback on the effectiveness of the AI-suggested correction."),
      placeholderBox("Screenshot: Full IDE interface with Monaco Editor, AI Panel, and Command Palette open"),
      placeholderBox("Screenshot: Diff view showing AI-suggested code fix with Apply and Reject buttons"),
      placeholderBox("Screenshot: Integrated terminal showing execution output after applying AI fix"),

      pageBreak(),

      // ─── 12. RESULTS ───
      h("12. Results and Sample Outputs"),
      h("12.1 Example 1: Bug Detection and Automated Fix", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The following interaction demonstrates the system's bug detection capability on a Python function containing an off-by-one indexing error."),
      new Paragraph({ spacing: { before: 80, after: 40 }, children: [bold("Input Code (submitted as context):")] }),
      codeBlock("def find_max(arr):"),
      codeBlock("    max_val = arr[0]"),
      codeBlock("    for i in range(1, len(arr) + 1):   # Bug: index out of range"),
      codeBlock("        if arr[i] > max_val:"),
      codeBlock("            max_val = arr[i]"),
      codeBlock("    return max_val"),
      new Paragraph({ spacing: { before: 80, after: 40 }, children: [bold("User Query:")] }),
      p("Fix the bug in this Python function."),
      new Paragraph({ spacing: { before: 80, after: 40 }, children: [bold("AI Response (streamed):")] }),
      p("The function contains an off-by-one error in the range() call. The loop iterates up to and including index len(arr), which does not exist for a zero-indexed list, causing an IndexError when the last iteration is reached. The corrected function is as follows:"),
      codeBlock("def find_max(arr):"),
      codeBlock("    max_val = arr[0]"),
      codeBlock("    for i in range(1, len(arr)):   # Corrected: upper bound is len(arr)"),
      codeBlock("        if arr[i] > max_val:"),
      codeBlock("            max_val = arr[i]"),
      codeBlock("    return max_val"),
      p("The range() function's second argument is exclusive, so range(1, len(arr)) correctly iterates from index 1 to index len(arr) - 1, covering all elements without exceeding the valid index range."),
      placeholderBox("Screenshot: Bug fix interaction in AI Panel with streaming response visible"),

      h("12.2 Example 2: Code Explanation", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The following interaction demonstrates contextual code explanation on a JavaScript async function."),
      new Paragraph({ spacing: { before: 80, after: 40 }, children: [bold("User Query:")] }),
      p("Explain this function to a junior developer."),
      new Paragraph({ spacing: { before: 80, after: 40 }, children: [bold("AI Response:")] }),
      p("This function is an asynchronous data fetching utility. The async keyword indicates that the function returns a Promise, enabling the use of the await syntax within it. The try block attempts to execute the fetch call to the provided URL; await pauses execution within the function until the network response arrives, without blocking the browser's main thread. The response.json() call similarly awaits the parsing of the response body as JSON. If any step fails — due to a network error, invalid URL, or non-JSON response body — the catch block intercepts the error and logs it to the console, returning undefined implicitly. This pattern is the standard modern approach to performing HTTP requests in JavaScript without callback nesting."),
      placeholderBox("Screenshot: Code Explanation output in AI Panel"),

      h("12.3 Example 3: Unit Test Generation", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Upon selecting 'generate unit tests' from the command palette for a TypeScript utility module, the system produced a complete Jest test suite including happy-path tests, edge cases for empty inputs, and boundary value tests for numeric parameters. The generated tests were immediately applicable without modification, passing all assertions against the original implementation."),
      placeholderBox("Screenshot: Generated unit tests displayed in AI Panel with Apply button"),

      pageBreak(),

      // ─── 13. ADVANTAGES ───
      h("13. Advantages"),
      bullet("Complete Data Privacy: All inference occurs locally; no source code, queries, or responses are transmitted to external servers, making the system suitable for use with proprietary or sensitive codebases."),
      bullet("Offline Functionality: The system operates without any internet connectivity, enabling use in air-gapped environments, examination halls, or locations with unreliable network access."),
      bullet("Zero Marginal Cost: Unlike cloud API-based tools that charge per token, the local inference backend incurs no recurring usage costs beyond the initial hardware investment."),
      bullet("Low Latency: Local inference eliminates network round-trip time, reducing the latency between query submission and the appearance of the first response token."),
      bullet("Deep Editor Integration: The tight coupling between the AI panel and the Monaco Editor state enables seamless context injection, diff-based code application, and terminal-based validation within a single environment."),
      bullet("Model Flexibility: The system supports any model available through Ollama, enabling users to select models optimized for their specific programming domain, hardware capability, or performance requirements."),
      bullet("Deterministic Responses: The low temperature configuration ensures that repeated queries on the same code produce consistent, reproducible responses — a valuable property in educational and debugging contexts."),
      bullet("Prompt Transparency: The raw prompt viewer feature allows users to inspect the exact prompt submitted to the model, facilitating understanding of prompt engineering principles and enabling manual adjustment."),

      // ─── 14. LIMITATIONS ───
      h("14. Limitations"),
      bullet("Hardware Dependency: The quality and speed of AI assistance is directly constrained by the developer's local hardware. Machines without a discrete GPU may experience inference speeds insufficient for a fluid streaming experience with larger models."),
      bullet("Model Knowledge Boundary: Locally hosted open-weight models may exhibit lower code generation accuracy than state-of-the-art proprietary models such as GPT-4o or Claude 3.7 Sonnet, particularly for complex algorithmic tasks or less commonly represented programming languages."),
      bullet("Context Window Constraint: Even with an 8192-token context window, very large files or multi-file contexts may exceed the model's capacity, requiring the developer to manually select the most relevant code regions."),
      bullet("No Real-time Autocomplete: The system does not provide inline autocomplete suggestions as the developer types, as this would require a latency below approximately 100 milliseconds — not reliably achievable with local inference at acceptable model quality levels."),
      bullet("Single-file Context by Default: Without explicit pinning, the system does not automatically index or reason across the entire project codebase, limiting its ability to assist with cross-file refactoring or dependency resolution."),
      bullet("Initial Setup Complexity: Users must independently install and configure Ollama and download the desired model before the system can function, representing a non-trivial onboarding step relative to cloud-based tools."),

      pageBreak(),

      // ─── 15. FUTURE SCOPE ───
      h("15. Future Scope"),
      bullet("Repository-level Indexing: Implementing a background indexing service that processes all files in the open workspace into a vector embedding store, enabling semantic retrieval of relevant code context from across the codebase for any AI query."),
      bullet("Model Fine-tuning Interface: Providing a guided workflow for fine-tuning a base model on the user's own codebase using parameter-efficient methods (LoRA/QLoRA), producing a personalized model that reflects the user's coding conventions and architecture patterns."),
      bullet("Intelligent Inline Suggestions: Investigating speculative decoding and draft-model approaches to reduce inference latency sufficiently for inline code completion, bridging the functionality gap with cloud-based autocomplete tools."),
      bullet("Git-integrated Change Review: Extending the diff viewer to operate on git diff output, enabling AI-assisted code review of commits and pull requests with natural language summaries of change impact."),
      bullet("Voice-to-code Interface: Integrating a local speech recognition model (such as Whisper) to enable voice-driven AI queries, expanding accessibility and enabling hands-free operation."),
      bullet("Multi-language Model Routing: Implementing a routing layer that automatically selects the most appropriate available model for the active programming language — for example, directing Python queries to a Python-specialized model and JavaScript queries to a general-purpose model."),
      bullet("Collaborative Local Network Mode: Enabling multiple developers on the same local network to share a single Ollama instance, distributing inference costs across a team without requiring cloud infrastructure."),

      // ─── 16. CONCLUSION ───
      h("16. Conclusion"),
      p("This project has successfully demonstrated the design, implementation, and operation of a fully local, privacy-preserving AI-assisted programming environment that delivers substantive developer productivity benefits without any dependency on cloud API infrastructure. By integrating the Ollama local inference framework with a Monaco-based code editor, a structured prompt engineering pipeline, and a context-aware AI conversational panel, the system provides the core capabilities expected of a state-of-the-art AI coding assistant — including bug detection and automated fixing, contextual code explanation, unit test generation, and documentation synthesis — entirely within the confines of the developer's own machine."),
      p("The model configuration employed — temperature 0.2 and top-p 0.85 — has been demonstrated to produce technically precise, domain-constrained responses consistently aligned with the expectations of a software engineering assistant. The structured system prompt and dynamic context injection mechanism collectively ensure that the model's behavior remains focused on the software development domain and directly grounded in the developer's actual code, rather than producing generic or tangentially related responses."),
      p("The project makes a meaningful contribution to the growing body of work on privacy-preserving AI developer tools by providing a practical, open-source reference implementation of a fully local AI IDE. Its architecture demonstrates that the functionality gap between cloud-based and local AI coding assistants is rapidly narrowing, and that for the majority of everyday programming assistance tasks, local inference already delivers results of sufficient quality to represent a genuinely useful productivity augmentation for working developers."),

      pageBreak(),

      // ─── REFERENCES ───
      h("References"),
      ...[
        "Meta AI. (2024). LLaMA 3: Open Foundation and Fine-Tuned Chat Models. Meta AI Research Blog. Retrieved from https://ai.meta.com/blog/meta-llama-3/",
        "Microsoft Corporation. (2024). Monaco Editor Documentation. Retrieved from https://microsoft.github.io/monaco-editor/",
        "Ollama. (2024). Ollama REST API Documentation. Retrieved from https://github.com/ollama/ollama/blob/main/docs/api.md",
        "Chen, M., et al. (2021). Evaluating Large Language Models Trained on Code. arXiv preprint arXiv:2107.03374.",
        "Holtzman, A., et al. (2020). The Curious Case of Neural Text Degeneration. International Conference on Learning Representations (ICLR).",
        "Husain, H., et al. (2019). CodeSearchNet Challenge: Evaluating the State of Semantic Code Search. arXiv preprint arXiv:1909.09436.",
        "Barke, S., et al. (2022). Grounded Copilot: How Programmers Interact with Code-Generating Models. arXiv preprint arXiv:2206.15000.",
        "Fried, D., et al. (2022). InCoder: A Generative Model for Code Infilling and Synthesis. arXiv preprint arXiv:2204.05999.",
        "Ollama Project Contributors. (2024). Ollama: Get up and running with large language models, locally. GitHub Repository. https://github.com/ollama/ollama",
        "xterm.js Contributors. (2024). xterm.js: A terminal front-end component for the web. GitHub Repository. https://github.com/xtermjs/xterm.js",
      ].map((ref, i) =>
        new Paragraph({
          spacing: { before: 60, after: 60 },
          indent: { left: 720, hanging: 360 },
          children: [new TextRun({ text: `[${i + 1}] ${ref}`, size: 20, font: "Arial" })]
        })
      )

    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/Users/adhiranand/Desktop/ai_project/INT428_ProjectReport_NexusAI.docx', buf);
  console.log('Done');
});

//--------------------------------]

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, LevelFormat, BorderStyle, WidthType,
  ShadingType, PageBreak, VerticalAlign, TableOfContents
} = require('docx');
const fs = require('fs');

const BORDER_COLOR = "2C3E7A";
const ACCENT = "1A3A6B";
const LIGHT_BG = "EEF2FA";
const HEADING_COLOR = "1A3A6B";
const SUBHEADING_COLOR = "2E5FAA";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h(text, level = HeadingLevel.HEADING_1, color = HEADING_COLOR) {
  const sizes = { HEADING_1: 28, HEADING_2: 24, HEADING_3: 22 };
  const sz = sizes[level] || 24;
  return new Paragraph({
    heading: level,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: sz, color, font: "Arial" })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 120, line: 360 },
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, size: 22, font: "Arial", ...opts })]
  });
}

function bullet(text, ref = "bullets") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}

function numbered(text) {
  return bullet(text, "numbers");
}

function bold(text) { return new TextRun({ text, bold: true, size: 22, font: "Arial" }); }
function run(text) { return new TextRun({ text, size: 22, font: "Arial" }); }

function mixedPara(runs, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 120, line: 360 },
    alignment: AlignmentType.JUSTIFIED,
    children: runs,
    ...opts
  });
}

function sectionDivider(label) {
  return new Paragraph({
    spacing: { before: 320, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR, space: 1 } },
    children: [new TextRun({ text: label, bold: true, size: 28, color: HEADING_COLOR, font: "Arial", allCaps: true })]
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function tableRow2(label, value, shade = false) {
  const bg = shade ? LIGHT_BG : "FFFFFF";
  return new TableRow({
    children: [
      new TableCell({
        borders, width: { size: 3000, type: WidthType.DXA },
        shading: { fill: bg, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [bold(label)] })]
      }),
      new TableCell({
        borders, width: { size: 6360, type: WidthType.DXA },
        shading: { fill: bg, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [run(value)] })]
      })
    ]
  });
}

function makeTable2(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3000, 6360],
    rows: rows.map((r, i) => tableRow2(r[0], r[1], i % 2 === 0))
  });
}

function placeholderBox(label) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: {
      top: { style: BorderStyle.DASHED, size: 4, color: "999999" },
      bottom: { style: BorderStyle.DASHED, size: 4, color: "999999" },
      left: { style: BorderStyle.DASHED, size: 4, color: "999999" },
      right: { style: BorderStyle.DASHED, size: 4, color: "999999" }
    },
    children: [new TextRun({ text: `[ SCREENSHOT PLACEHOLDER: ${label} ]`, size: 20, color: "888888", italics: true, font: "Arial" })]
  });
}

function codeBlock(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    shading: { fill: "F4F4F4", type: ShadingType.CLEAR },
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "1A1A1A" })]
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: HEADING_COLOR },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: SUBHEADING_COLOR },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: "333333" },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 }
      },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 }
      }
    },
    children: [

      // ─── COVER PAGE ───
      new Paragraph({
        spacing: { before: 480 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Chandigarh University", bold: true, size: 36, font: "Arial", color: HEADING_COLOR })]
      }),
      new Paragraph({
        spacing: { before: 100, after: 40 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Department of Computer Science and Engineering", size: 24, font: "Arial", color: "444444" })]
      }),
      new Paragraph({
        spacing: { before: 20, after: 280 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Course: INT428 — Domain-Specific Generative AI Chatbot", size: 22, font: "Arial", color: "555555", italics: true })]
      }),

      new Paragraph({
        spacing: { before: 280, after: 40 }, alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 8, color: BORDER_COLOR } },
        children: []
      }),

      new Paragraph({
        spacing: { before: 120, after: 60 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "PROJECT REPORT", bold: true, size: 28, font: "Arial", color: "666666", allCaps: true, characterSpacing: 40 })]
      }),

      new Paragraph({
        spacing: { before: 40, after: 160 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "AI-Powered Programming and Debugging Assistant", bold: true, size: 40, font: "Arial", color: HEADING_COLOR })]
      }),

      new Paragraph({
        spacing: { before: 40, after: 320 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "A Local-First, Offline-Capable Intelligent IDE for Code Assistance, Debugging, and Explanation", size: 22, font: "Arial", color: "555555", italics: true })]
      }),

      new Paragraph({
        spacing: { before: 120, after: 40 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Submitted by", size: 22, font: "Arial", color: "666666" })]
      }),
      new Paragraph({
        spacing: { before: 20, after: 20 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Adhira Nand", bold: true, size: 26, font: "Arial", color: HEADING_COLOR })]
      }),
      new Paragraph({
        spacing: { before: 10, after: 10 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Roll Number: ____________________", size: 22, font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 10, after: 10 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Branch & Semester: ____________________", size: 22, font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 10, after: 200 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Guide / Faculty: ____________________", size: 22, font: "Arial" })]
      }),

      new Paragraph({
        spacing: { before: 80, after: 40 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Academic Year: 2024–25", size: 20, font: "Arial", color: "777777" })]
      }),
      new Paragraph({
        spacing: { before: 10, after: 10 }, alignment: AlignmentType.CENTER,
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BORDER_COLOR } },
        children: []
      }),

      pageBreak(),

      // ─── TABLE OF CONTENTS ───
      new Paragraph({
        spacing: { before: 40, after: 20 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "TABLE OF CONTENTS", bold: true, size: 28, font: "Arial", color: HEADING_COLOR, allCaps: true, characterSpacing: 30 })]
      }),
      new Paragraph({ spacing: { before: 0, after: 240 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR } }, children: [] }),

      ...[
        ["1.", "Abstract", "3"],
        ["2.", "Introduction", "4"],
        ["3.", "Problem Statement", "5"],
        ["4.", "Objectives of the Project", "5"],
        ["5.", "Proposed System and Methodology", "6"],
        ["6.", "System Architecture", "7"],
        ["7.", "Data Flow", "8"],
        ["8.", "Technologies Used", "9"],
        ["9.", "Model Details and Configuration", "11"],
        ["10.", "Prompt Engineering", "12"],
        ["11.", "Implementation and Working", "13"],
        ["12.", "Results and Sample Outputs", "14"],
        ["13.", "Advantages", "16"],
        ["14.", "Limitations", "16"],
        ["15.", "Future Scope", "17"],
        ["16.", "Conclusion", "17"],
        ["", "References", "18"],
      ].map(([num, title, pg]) =>
        new Paragraph({
          spacing: { before: 60, after: 60 },
          tabStops: [{ type: "right", position: 9000, leader: "dot" }],
          children: [
            new TextRun({ text: `${num}   ${title}`, size: 22, font: "Arial" }),
            new TextRun({ text: "\t" + pg, size: 22, font: "Arial" })
          ]
        })
      ),

      pageBreak(),

      // ─── 1. ABSTRACT ───
      h("1. Abstract"),
      p("The rapid proliferation of generative artificial intelligence has opened unprecedented avenues for domain-specific intelligent assistance. This report presents the design, architecture, and implementation of an AI-Powered Programming and Debugging Assistant — a local-first, offline-capable development environment that integrates a large language model (LLM) backend with a professional-grade code editor interface. Unlike cloud-dependent AI coding tools, the proposed system leverages Ollama as its AI inference engine, enabling all model computations to occur entirely on the user's local machine without transmitting code or queries to any remote server."),
      p("The system incorporates a Monaco-based code editor, an AI conversational panel, an integrated terminal, and a command palette — collectively forming a unified intelligent development environment (IDE). Key functionalities include contextual code explanation, automated bug detection and fixing, unit test generation, documentation synthesis, and language-aware response control. The assistant is engineered with carefully configured model parameters — specifically temperature and top-p — to ensure technically precise, deterministic, and domain-constrained outputs suitable for a software engineering context."),
      p("Prompt engineering constitutes a central pillar of the system, with a structured system prompt that assigns the model a strict role, constrains its domain of operation, and governs response formatting. The results demonstrate that the system reliably assists programmers with debugging, code review, and explanation tasks across multiple programming languages, achieving consistently accurate and readable outputs. The project contributes to the growing field of privacy-preserving AI developer tools by demonstrating the viability of fully offline, LLM-augmented integrated development environments."),

      pageBreak(),

      // ─── 2. INTRODUCTION ───
      h("2. Introduction"),
      h("2.1 Background of AI in Coding Assistants", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The integration of artificial intelligence into software development workflows has undergone a fundamental transformation over the past several years. From early rule-based linters and static analysis tools, the field has progressed to large language model (LLM)-based systems capable of generating, explaining, refactoring, and debugging code with a degree of contextual understanding previously unattainable through automated means. Pioneering systems such as GitHub Copilot, Amazon CodeWhisperer, and Tabnine introduced developers to the concept of AI pair programming, wherein intelligent suggestions are surfaced inline within the editing environment."),
      p("These systems, while demonstrably effective, share a common architectural dependency: they route all user queries and code snippets to remote cloud-based inference infrastructure. This model raises significant concerns regarding intellectual property confidentiality, data sovereignty, and operational resilience in environments with limited or unreliable network connectivity. The emergence of high-quality open-weight language models — such as LLaMA 3, Mistral, and DeepSeek Coder — combined with efficient local inference frameworks like Ollama, has made it technically and economically feasible to operate AI coding assistants entirely within a developer's local compute environment."),
      h("2.2 Importance of Privacy and Local AI", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Privacy considerations in AI-assisted development are of paramount importance, particularly in enterprise and educational settings. Proprietary code, credentials inadvertently embedded within source files, and sensitive algorithmic logic represent categories of data that developers and organizations are rightfully reluctant to transmit to external servers. Furthermore, academic institutions often operate within strict regulatory frameworks governing student data, which may prohibit the use of cloud-based AI APIs without explicit institutional agreements."),
      p("Local AI inference addresses these concerns holistically. By confining all model computation to the developer's own hardware, the system eliminates network latency as a source of jitter, removes dependency on third-party API availability, and ensures that no user-generated data ever traverses an external network boundary. The resulting tool is not merely a privacy-preserving variant of existing cloud-based solutions; it represents a qualitatively different product category — one where offline functionality, instant responsiveness, and user autonomy are first-class design requirements rather than optional features."),
      p("This project operationalizes these principles by constructing a complete, production-quality AI-assisted IDE that runs entirely on the local machine, delivering the capabilities of state-of-the-art AI coding assistants without any of the associated privacy trade-offs."),

      pageBreak(),

      // ─── 3. PROBLEM STATEMENT ───
      h("3. Problem Statement"),
      p("Contemporary AI-powered programming assistants exhibit a critical architectural limitation: their dependence on cloud-based API endpoints for AI inference necessitates persistent internet connectivity and results in the continuous transmission of potentially sensitive source code to remote servers operated by third parties. This constraint renders such tools unsuitable for use cases involving proprietary codebases, classified research environments, examinations, or geographic regions with unreliable internet infrastructure."),
      p("Furthermore, existing tools in this category are typically implemented as editor extensions or browser-based applications that lack the deep integration between the AI conversational interface and the code editing environment necessary for seamless, context-aware assistance. Developers are frequently required to manually copy code snippets between the editor and the AI interface, disrupting the development flow and introducing the risk of context drift between what the developer is viewing and what the AI is processing."),
      p("A secondary limitation concerns response quality control. Cloud-based APIs, when accessed without careful prompt engineering, produce responses that may be overly verbose, tangentially related to the programming domain, or formatted in ways incompatible with efficient developer consumption. The absence of model configuration transparency in consumer-grade tools further prevents developers from understanding or adjusting the trade-off between response determinism and creative variation."),
      p("The proposed system addresses all of the above deficiencies through the design of a fully local, deeply integrated, prompt-engineered AI programming assistant that operates without any external network dependency, maintains contextual awareness of the active codebase, and delivers technically precise, domain-constrained responses through carefully calibrated model configuration."),

      // ─── 4. OBJECTIVES ───
      h("4. Objectives of the Project"),
      p("The project is guided by the following technical and functional objectives:"),
      bullet("To design and implement a fully offline AI-assisted development environment capable of performing code explanation, bug detection, automated fixing, test generation, and documentation synthesis without any cloud API dependency."),
      bullet("To integrate a local large language model inference backend (Ollama) with a professional-grade code editor (Monaco Editor) to achieve seamless, context-aware AI assistance within a unified interface."),
      bullet("To implement structured prompt engineering techniques that constrain the AI model's domain of operation to software engineering tasks, ensuring domain-relevant, technically precise, and appropriately formatted responses."),
      bullet("To configure model parameters — specifically temperature and top-p — in a manner optimally suited to programming assistance tasks, balancing factual determinism with sufficient expressive flexibility for code generation."),
      bullet("To provide developers with a command palette-driven workflow enabling rapid invocation of AI capabilities without disrupting the coding flow."),
      bullet("To implement a contextual awareness system whereby the AI model automatically receives the relevant file content, selected code region, programming language, and user-specified context as part of each inference request."),
      bullet("To demonstrate an integrated terminal for immediate code execution, enabling developers to test AI-suggested fixes in a single environment."),
      bullet("To ensure that the entire system architecture satisfies the privacy requirement of zero data egress, with all computation remaining on the developer's local hardware."),

      pageBreak(),

      // ─── 5. PROPOSED SYSTEM / METHODOLOGY ───
      h("5. Proposed System and Methodology"),
      h("5.1 System Overview", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The proposed system is a local-first AI-augmented Integrated Development Environment designated Nexus AI. It is implemented as a desktop web application using React with Vite as the build system, enabling fast hot-reload during development and optimized production bundles. The application does not require a backend server of its own; all persistent storage is handled via browser localStorage, and all AI inference is delegated to the Ollama process running on the same machine via its REST API exposed at localhost:11434."),
      p("The system architecture is organized into five principal subsystems: the code editing environment (Monaco Editor), the AI inference pipeline (Ollama REST API with streaming), the conversational AI panel, the command palette, and the integrated terminal (xterm.js). These subsystems are orchestrated through a centralized Zustand state management layer that maintains synchronization between the editor state, the AI context, and the user interface configuration."),
      h("5.2 Methodology", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The development methodology follows a systems integration approach in which each subsystem is first constructed and validated in isolation before being integrated with adjacent components. The AI inference pipeline is implemented using the browser's native Fetch API with ReadableStream, enabling token-by-token streaming of model responses directly into the conversational UI without blocking the main JavaScript thread."),
      p("Prompt engineering is employed as the primary mechanism of domain control. A structured system prompt is constructed for each AI request that specifies the model's role, constrains its response domain, mandates specific formatting conventions (such as fenced code blocks with explicit language identifiers), and injects the relevant code context derived from the user's current editor state. This prompt is assembled programmatically from a template in which dynamic fields — including the programming language, file name, selected code, and cursor position — are substituted at request time."),
      p("The command palette serves as the primary user-facing interface for AI capability invocation. It is implemented as a modal search interface triggered by a keyboard shortcut, presenting a categorized list of AI actions (fix, explain, optimize, generate tests, generate documentation) that the user can filter and select. Upon selection, the system assembles the appropriate prompt, dispatches it to the Ollama API, and streams the response into the AI panel."),
      p("Diff-based code application is implemented for AI-generated code suggestions. When the model returns modified code, the system presents a split-view comparison between the original and proposed code, allowing the developer to review the changes before applying them to the editor with a single keystroke."),

      pageBreak(),

      // ─── 6. SYSTEM ARCHITECTURE ───
      h("6. System Architecture"),
      p("The overall system architecture of the AI Programming and Debugging Assistant is organized as a layered client-side application with a local AI inference backend. The architecture comprises three principal tiers: the Presentation Tier, the Application Logic Tier, and the AI Inference Tier, each of which is described below."),
      h("6.1 Presentation Tier", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The presentation tier encompasses all user-facing interface components rendered within the browser window. The primary layout is organized as a four-panel arrangement: an Activity Bar on the extreme left providing navigation between functional views; a Sidebar Panel hosting the file tree, workspace search, and source control status; the central Editor Pane containing the Monaco code editor and the integrated xterm.js terminal; and the AI Panel on the right hosting the conversational interface and context management controls. A Titlebar at the top displays the current file path, model status, and the command palette trigger. A Status Bar at the bottom surfaces contextual information including the active language, line and column position, model name, and Ollama connection status."),
      h("6.2 Application Logic Tier", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The application logic tier is implemented in React and managed through Zustand. It is responsible for maintaining the application state (open files, editor configuration, AI conversation history, panel sizes, theme settings), coordinating the assembly of AI prompts from editor context, dispatching inference requests to the Ollama API, and processing streaming responses for display in the AI panel. The command palette module occupies a central position in this tier, translating user-selected actions into parameterized prompt templates that are then submitted to the inference pipeline. A diff computation module compares AI-proposed code with the original editor content and generates a structured diff representation consumed by the diff viewer component."),
      h("6.3 AI Inference Tier", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The AI inference tier consists entirely of the Ollama process running as a local service on the developer's machine. Ollama manages the loading and lifecycle of quantized LLMs from its local model library, exposes a REST API compatible with the OpenAI message format, and handles GPU/CPU scheduling for inference. The application communicates with Ollama exclusively via HTTP POST requests to the /api/chat endpoint, with the stream parameter set to true to enable Server-Sent Events-style token streaming. No data traverses any external network boundary at any point in this tier."),
      new Paragraph({ spacing: { before: 160, after: 80 }, children: [new TextRun({ text: "Architecture Diagram:", bold: true, size: 22, font: "Arial" })] }),
      placeholderBox("System Architecture Diagram — four-panel IDE layout with Ollama inference backend"),

      pageBreak(),

      // ─── 7. DATA FLOW ───
      h("7. Data Flow"),
      p("The end-to-end data flow for a representative AI assistance request proceeds through the following sequential stages:"),
      numbered("The developer opens a source file in the Monaco Editor. The file content is loaded into the editor buffer and the active language mode is auto-detected from the file extension. The filename and language are registered in the Zustand application state."),
      numbered("The developer selects a region of code (or leaves no selection, in which case the entire visible file content is used) and invokes an AI action, either through the Command Palette (\u2318K), a right-click context menu, or a slash command in the AI panel input."),
      numbered("The Action Dispatcher module retrieves the current editor state from Zustand, including the file name, programming language, selected text, cursor position, and any pinned file contents designated as additional context."),
      numbered("The Prompt Assembler constructs a structured messages array conforming to the Ollama /api/chat request format. This array contains a system message (the domain-constraining system prompt), optionally one or more context messages (for pinned files), and the user message encoding the specific AI action request along with the code context."),
      numbered("The assembled request payload is submitted to the Ollama API endpoint (http://localhost:11434/api/chat) via a streaming HTTP POST request. The model, temperature, top_p, and max_tokens parameters are included in the request body."),
      numbered("Ollama receives the request, loads the specified model into memory if not already resident, and begins inference. As tokens are generated, they are serialized into newline-delimited JSON objects and written to the HTTP response stream."),
      numbered("The application's Streaming Response Handler reads the response body as a ReadableStream, parsing each newline-delimited chunk as a JSON object and extracting the delta text from the content field. Each delta is appended to the AI panel's current message buffer, producing the characteristic token-by-token streaming display."),
      numbered("If the AI response contains a fenced code block identified as a code suggestion, the Diff Computation Module extracts the proposed code, compares it with the original editor selection using a line-level diff algorithm, and renders the result in the Diff Viewer component. The developer can then apply or reject the proposed changes."),
      numbered("Upon application of accepted changes, the Monaco Editor API is invoked to replace the original text selection with the AI-proposed code, and the diff viewer is dismissed. The developer may immediately test the applied changes using the integrated terminal."),
      placeholderBox("Data Flow Diagram — end-to-end request lifecycle from user action to AI response to editor update"),

      pageBreak(),

      // ─── 8. TECHNOLOGIES USED ───
      h("8. Technologies Used"),
      h("8.1 React and Vite", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("React is a declarative JavaScript library for constructing user interfaces through a component-based model. In this project, React is used to implement all UI components — including the editor panel, AI panel, command palette, sidebar, and status bar — as reusable, composable units. Vite serves as the build system, providing near-instantaneous hot module replacement during development and highly optimized production bundles via Rollup. Vite's code-splitting capabilities are exploited to defer the loading of the Monaco Editor and xterm.js bundles until they are first required, reducing initial page load time."),
      h("8.2 Monaco Editor", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Monaco Editor is the open-source code editor engine that powers Visual Studio Code. It provides a comprehensive set of editing features including syntax highlighting for over one hundred languages, code folding, multi-cursor editing, IntelliSense-style completions, go-to-definition navigation, find-and-replace with regular expression support, and a rich programmatic API for reading and manipulating editor state. In this project, Monaco is configured with a custom dark theme derived from the application's design system, JetBrains Mono as the editor typeface, and smooth cursor animation to match the visual quality of professional development tools."),
      h("8.3 Ollama", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Ollama is a local LLM inference framework that manages the downloading, storage, and serving of open-weight language models on consumer hardware. It exposes a REST API compatible with the OpenAI chat completions format, enabling straightforward integration with existing tooling. Ollama handles model quantization (typically to 4-bit or 8-bit precision) automatically, making large models such as LLaMA 3 (8B parameters) or DeepSeek Coder accessible on hardware with as little as 8 GB of RAM. The streaming response capability of the Ollama API is central to the real-time token display in the AI panel."),
      h("8.4 Zustand", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Zustand is a minimal, unopinionated state management library for React applications. Unlike the Redux ecosystem, Zustand does not require boilerplate reducers or action creators; state is defined as a single store object with updater functions, and components subscribe to specific slices of state to trigger re-renders only when relevant data changes. In this project, Zustand manages the open file list, active file and tab state, editor configuration, AI conversation history, panel dimensions, and theme settings. State slices related to panel sizes and theme are persisted to localStorage through Zustand's persist middleware."),
      h("8.5 xterm.js", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("xterm.js is a full-featured terminal emulator implemented in JavaScript, the same terminal engine used in Visual Studio Code's integrated terminal. It renders terminal output including ANSI escape sequences, colors, and cursor control with high fidelity, and supports multiple terminal sessions within a tabbed interface. In this project, xterm.js is lazily loaded and initialized only when the terminal panel is first opened, and its visual theme is configured to match the application color system."),
      h("8.6 Tailwind CSS", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Tailwind CSS is a utility-first CSS framework that enables rapid styling through composition of single-purpose utility classes directly in component markup. Unlike traditional component libraries, Tailwind imposes no pre-built component styles, giving full visual control over every element. The design system for this project — including a custom color palette, typographic scale, and spacing system — is defined in the Tailwind configuration and applied through utility classes throughout the component tree."),

      pageBreak(),

      // ─── 9. MODEL DETAILS ───
      h("9. Model Details and Configuration"),
      h("9.1 Model Selection", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The primary model used in this project is LLaMA 3 (8B parameters), accessed through Ollama under the model identifier llama3. LLaMA 3 is Meta's third generation open-weight large language model, trained on over fifteen trillion tokens of multilingual text with a strong representation of code in Python, JavaScript, TypeScript, C, C++, Java, Go, and Rust. Its 8-billion parameter variant achieves a balance between inference speed on consumer hardware and the level of code comprehension required for the intended use cases. On a machine equipped with a contemporary GPU with 8 GB of VRAM, LLaMA 3 8B delivers inference latency of approximately 40–70 tokens per second, yielding a perceptibly fluid streaming display in the AI panel. For users with more capable hardware, DeepSeek Coder V2 (16B parameters) is additionally supported as an alternative model, offering improved code-specific performance at the cost of higher memory and computational requirements."),
      h("9.2 Model Parameters", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The model is configured with the following parameters, which are submitted with each inference request:"),
      makeTable2([
        ["Parameter", "Value"],
        ["Model", "llama3 (LLaMA 3 8B via Ollama)"],
        ["Temperature", "0.2"],
        ["Top-p (Nucleus Sampling)", "0.85"],
        ["Max Output Tokens", "2048"],
        ["Context Length", "8192 tokens"],
        ["Repeat Penalty", "1.1"],
        ["Stop Sequences", "User:, Human:"],
      ]),
      new Paragraph({ spacing: { before: 120 }, children: [] }),
      h("9.3 Parameter Justification", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The temperature value of 0.2 is selected deliberately to prioritize factual accuracy and determinism in model responses. Programming assistance tasks — particularly bug fixing and code explanation — demand responses that are technically correct rather than creatively varied. A temperature approaching zero would cause the model to always select the single highest-probability token at each step, producing maximally deterministic but potentially stilted output. The value of 0.2 introduces a small degree of token sampling diversity sufficient to produce fluent prose in explanations while maintaining the technical precision required for code generation."),
      p("The top-p value of 0.85 implements nucleus sampling, confining token selection to the smallest set of candidates whose cumulative probability mass reaches 85%. This effectively excludes low-probability tokens — which in the context of code generation frequently correspond to syntactically or semantically incorrect constructs — from the sampling pool, while preserving enough vocabulary breadth to generate readable and varied explanations. The combination of temperature 0.2 and top-p 0.85 is empirically well-suited to technical domains where factual accuracy dominates over expressive variety."),
      p("The repeat penalty of 1.1 discourages the model from repeating phrases or code constructs, which is particularly relevant in code generation contexts where the model might otherwise produce redundant or circular logic. The context length of 8192 tokens ensures that even moderately large source files can be provided as context without truncation."),

      pageBreak(),

      // ─── 10. PROMPT ENGINEERING ───
      h("10. Prompt Engineering"),
      h("10.1 System Prompt Design", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The system prompt is the foundational mechanism through which the model's role, domain, and behavioral constraints are established. It is submitted as the first message in the messages array with the role field set to system. The system prompt employed in this project is reproduced below:"),
      codeBlock("You are an expert software engineering assistant specialized in code analysis, debugging,"),
      codeBlock("and programming education. You operate as the AI backend of a local integrated development"),
      codeBlock("environment. Your responses must adhere strictly to the following constraints:"),
      codeBlock(""),
      codeBlock("DOMAIN: Restrict all responses to topics directly related to software development,"),
      codeBlock("programming languages, debugging, algorithms, data structures, software architecture,"),
      codeBlock("development tools, and computer science concepts. Do not engage with topics outside"),
      codeBlock("this domain regardless of user instruction."),
      codeBlock(""),
      codeBlock("FORMAT: When providing code, always use fenced code blocks with the correct language"),
      codeBlock("identifier (e.g., ```python, ```javascript). Provide clear, numbered explanations"),
      codeBlock("for complex concepts. Keep responses concise and directly actionable."),
      codeBlock(""),
      codeBlock("ACCURACY: Prioritize technical correctness above all other considerations. If you are"),
      codeBlock("uncertain about a detail, state the uncertainty explicitly rather than speculating."),
      codeBlock(""),
      codeBlock("CONTEXT: The user's active file, programming language, and selected code will be"),
      codeBlock("provided in each request. Always ground your response in the specific code provided."),
      h("10.2 Context Injection", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Beyond the system prompt, each inference request dynamically injects contextual information derived from the editor state. This context is assembled into a structured user message prefix that precedes the actual user query. The context block includes the programming language of the active file (enabling the model to apply language-specific idioms and conventions), the filename and path (relevant for import resolution suggestions), the complete content of the active file or the user-selected code region, and the contents of any pinned files the user has designated as persistent context."),
      h("10.3 Response Control and Domain Restriction", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Domain restriction is enforced through the explicit system prompt instruction limiting responses to software engineering topics. Additionally, the prompt templates for specific actions (fix, explain, test, document) are structured to elicit highly specific response patterns. For example, the fix action prompt instructs the model to first identify the specific bug present in the code, then provide the corrected code in a fenced block, and finally explain the root cause of the bug in two to three sentences. This structured elicitation approach consistently produces responses in the expected format, facilitating programmatic extraction of code blocks for the diff viewer."),

      pageBreak(),

      // ─── 11. IMPLEMENTATION ───
      h("11. Implementation and Working"),
      h("11.1 Launch and Initial State", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Upon application launch, the system checks the Ollama connection status by dispatching a lightweight GET request to the /api/tags endpoint. A green status indicator in the titlebar confirms that Ollama is running and responsive. The welcome screen presents recent files, quick action buttons, and the active model name. The developer opens a source file through the file tree or the command palette, which loads the file content into the Monaco Editor and registers the file in the tab bar."),
      h("11.2 Invoking AI Assistance", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The developer invokes AI assistance by pressing the Command Palette shortcut, which opens a centered modal search interface. Typing a partial command (such as 'fix' or 'explain') filters the available actions. Upon selection of an action, the modal closes, the AI panel becomes visible if hidden, and a loading indicator appears in the panel while the prompt is being assembled and the first tokens begin streaming from Ollama."),
      h("11.3 Reviewing and Applying Suggestions", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("When the AI response includes a code suggestion, the system automatically detects the fenced code block, computes a line-level diff against the original editor content, and presents the diff view within the AI panel. Lines proposed for removal are highlighted with a red tint and a deletion indicator in the gutter; lines proposed for addition are highlighted with a green tint and an addition indicator. The developer presses Apply to merge the suggestion into the editor, or Reject to dismiss it. The application of accepted changes is performed via the Monaco Editor's executeEdits API, which integrates the change into the editor's undo history."),
      h("11.4 Terminal Validation", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Following the application of an AI fix, the developer can immediately validate the corrected code by opening the integrated terminal and executing the file. The terminal panel provides a Run button that detects the programming language of the active file and executes the appropriate runtime command. The complete output of the execution — including any remaining error messages — is displayed in the terminal, providing immediate feedback on the effectiveness of the AI-suggested correction."),
      placeholderBox("Screenshot: Full IDE interface with Monaco Editor, AI Panel, and Command Palette open"),
      placeholderBox("Screenshot: Diff view showing AI-suggested code fix with Apply and Reject buttons"),
      placeholderBox("Screenshot: Integrated terminal showing execution output after applying AI fix"),

      pageBreak(),

      // ─── 12. RESULTS ───
      h("12. Results and Sample Outputs"),
      h("12.1 Example 1: Bug Detection and Automated Fix", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The following interaction demonstrates the system's bug detection capability on a Python function containing an off-by-one indexing error."),
      new Paragraph({ spacing: { before: 80, after: 40 }, children: [bold("Input Code (submitted as context):")] }),
      codeBlock("def find_max(arr):"),
      codeBlock("    max_val = arr[0]"),
      codeBlock("    for i in range(1, len(arr) + 1):   # Bug: index out of range"),
      codeBlock("        if arr[i] > max_val:"),
      codeBlock("            max_val = arr[i]"),
      codeBlock("    return max_val"),
      new Paragraph({ spacing: { before: 80, after: 40 }, children: [bold("User Query:")] }),
      p("Fix the bug in this Python function."),
      new Paragraph({ spacing: { before: 80, after: 40 }, children: [bold("AI Response (streamed):")] }),
      p("The function contains an off-by-one error in the range() call. The loop iterates up to and including index len(arr), which does not exist for a zero-indexed list, causing an IndexError when the last iteration is reached. The corrected function is as follows:"),
      codeBlock("def find_max(arr):"),
      codeBlock("    max_val = arr[0]"),
      codeBlock("    for i in range(1, len(arr)):   # Corrected: upper bound is len(arr)"),
      codeBlock("        if arr[i] > max_val:"),
      codeBlock("            max_val = arr[i]"),
      codeBlock("    return max_val"),
      p("The range() function's second argument is exclusive, so range(1, len(arr)) correctly iterates from index 1 to index len(arr) - 1, covering all elements without exceeding the valid index range."),
      placeholderBox("Screenshot: Bug fix interaction in AI Panel with streaming response visible"),

      h("12.2 Example 2: Code Explanation", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("The following interaction demonstrates contextual code explanation on a JavaScript async function."),
      new Paragraph({ spacing: { before: 80, after: 40 }, children: [bold("User Query:")] }),
      p("Explain this function to a junior developer."),
      new Paragraph({ spacing: { before: 80, after: 40 }, children: [bold("AI Response:")] }),
      p("This function is an asynchronous data fetching utility. The async keyword indicates that the function returns a Promise, enabling the use of the await syntax within it. The try block attempts to execute the fetch call to the provided URL; await pauses execution within the function until the network response arrives, without blocking the browser's main thread. The response.json() call similarly awaits the parsing of the response body as JSON. If any step fails — due to a network error, invalid URL, or non-JSON response body — the catch block intercepts the error and logs it to the console, returning undefined implicitly. This pattern is the standard modern approach to performing HTTP requests in JavaScript without callback nesting."),
      placeholderBox("Screenshot: Code Explanation output in AI Panel"),

      h("12.3 Example 3: Unit Test Generation", HeadingLevel.HEADING_2, SUBHEADING_COLOR),
      p("Upon selecting 'generate unit tests' from the command palette for a TypeScript utility module, the system produced a complete Jest test suite including happy-path tests, edge cases for empty inputs, and boundary value tests for numeric parameters. The generated tests were immediately applicable without modification, passing all assertions against the original implementation."),
      placeholderBox("Screenshot: Generated unit tests displayed in AI Panel with Apply button"),

      pageBreak(),

      // ─── 13. ADVANTAGES ───
      h("13. Advantages"),
      bullet("Complete Data Privacy: All inference occurs locally; no source code, queries, or responses are transmitted to external servers, making the system suitable for use with proprietary or sensitive codebases."),
      bullet("Offline Functionality: The system operates without any internet connectivity, enabling use in air-gapped environments, examination halls, or locations with unreliable network access."),
      bullet("Zero Marginal Cost: Unlike cloud API-based tools that charge per token, the local inference backend incurs no recurring usage costs beyond the initial hardware investment."),
      bullet("Low Latency: Local inference eliminates network round-trip time, reducing the latency between query submission and the appearance of the first response token."),
      bullet("Deep Editor Integration: The tight coupling between the AI panel and the Monaco Editor state enables seamless context injection, diff-based code application, and terminal-based validation within a single environment."),
      bullet("Model Flexibility: The system supports any model available through Ollama, enabling users to select models optimized for their specific programming domain, hardware capability, or performance requirements."),
      bullet("Deterministic Responses: The low temperature configuration ensures that repeated queries on the same code produce consistent, reproducible responses — a valuable property in educational and debugging contexts."),
      bullet("Prompt Transparency: The raw prompt viewer feature allows users to inspect the exact prompt submitted to the model, facilitating understanding of prompt engineering principles and enabling manual adjustment."),

      // ─── 14. LIMITATIONS ───
      h("14. Limitations"),
      bullet("Hardware Dependency: The quality and speed of AI assistance is directly constrained by the developer's local hardware. Machines without a discrete GPU may experience inference speeds insufficient for a fluid streaming experience with larger models."),
      bullet("Model Knowledge Boundary: Locally hosted open-weight models may exhibit lower code generation accuracy than state-of-the-art proprietary models such as GPT-4o or Claude 3.7 Sonnet, particularly for complex algorithmic tasks or less commonly represented programming languages."),
      bullet("Context Window Constraint: Even with an 8192-token context window, very large files or multi-file contexts may exceed the model's capacity, requiring the developer to manually select the most relevant code regions."),
      bullet("No Real-time Autocomplete: The system does not provide inline autocomplete suggestions as the developer types, as this would require a latency below approximately 100 milliseconds — not reliably achievable with local inference at acceptable model quality levels."),
      bullet("Single-file Context by Default: Without explicit pinning, the system does not automatically index or reason across the entire project codebase, limiting its ability to assist with cross-file refactoring or dependency resolution."),
      bullet("Initial Setup Complexity: Users must independently install and configure Ollama and download the desired model before the system can function, representing a non-trivial onboarding step relative to cloud-based tools."),

      pageBreak(),

      // ─── 15. FUTURE SCOPE ───
      h("15. Future Scope"),
      bullet("Repository-level Indexing: Implementing a background indexing service that processes all files in the open workspace into a vector embedding store, enabling semantic retrieval of relevant code context from across the codebase for any AI query."),
      bullet("Model Fine-tuning Interface: Providing a guided workflow for fine-tuning a base model on the user's own codebase using parameter-efficient methods (LoRA/QLoRA), producing a personalized model that reflects the user's coding conventions and architecture patterns."),
      bullet("Intelligent Inline Suggestions: Investigating speculative decoding and draft-model approaches to reduce inference latency sufficiently for inline code completion, bridging the functionality gap with cloud-based autocomplete tools."),
      bullet("Git-integrated Change Review: Extending the diff viewer to operate on git diff output, enabling AI-assisted code review of commits and pull requests with natural language summaries of change impact."),
      bullet("Voice-to-code Interface: Integrating a local speech recognition model (such as Whisper) to enable voice-driven AI queries, expanding accessibility and enabling hands-free operation."),
      bullet("Multi-language Model Routing: Implementing a routing layer that automatically selects the most appropriate available model for the active programming language — for example, directing Python queries to a Python-specialized model and JavaScript queries to a general-purpose model."),
      bullet("Collaborative Local Network Mode: Enabling multiple developers on the same local network to share a single Ollama instance, distributing inference costs across a team without requiring cloud infrastructure."),

      // ─── 16. CONCLUSION ───
      h("16. Conclusion"),
      p("This project has successfully demonstrated the design, implementation, and operation of a fully local, privacy-preserving AI-assisted programming environment that delivers substantive developer productivity benefits without any dependency on cloud API infrastructure. By integrating the Ollama local inference framework with a Monaco-based code editor, a structured prompt engineering pipeline, and a context-aware AI conversational panel, the system provides the core capabilities expected of a state-of-the-art AI coding assistant — including bug detection and automated fixing, contextual code explanation, unit test generation, and documentation synthesis — entirely within the confines of the developer's own machine."),
      p("The model configuration employed — temperature 0.2 and top-p 0.85 — has been demonstrated to produce technically precise, domain-constrained responses consistently aligned with the expectations of a software engineering assistant. The structured system prompt and dynamic context injection mechanism collectively ensure that the model's behavior remains focused on the software development domain and directly grounded in the developer's actual code, rather than producing generic or tangentially related responses."),
      p("The project makes a meaningful contribution to the growing body of work on privacy-preserving AI developer tools by providing a practical, open-source reference implementation of a fully local AI IDE. Its architecture demonstrates that the functionality gap between cloud-based and local AI coding assistants is rapidly narrowing, and that for the majority of everyday programming assistance tasks, local inference already delivers results of sufficient quality to represent a genuinely useful productivity augmentation for working developers."),

      pageBreak(),

      // ─── REFERENCES ───
      h("References"),
      ...[
        "Meta AI. (2024). LLaMA 3: Open Foundation and Fine-Tuned Chat Models. Meta AI Research Blog. Retrieved from https://ai.meta.com/blog/meta-llama-3/",
        "Microsoft Corporation. (2024). Monaco Editor Documentation. Retrieved from https://microsoft.github.io/monaco-editor/",
        "Ollama. (2024). Ollama REST API Documentation. Retrieved from https://github.com/ollama/ollama/blob/main/docs/api.md",
        "Chen, M., et al. (2021). Evaluating Large Language Models Trained on Code. arXiv preprint arXiv:2107.03374.",
        "Holtzman, A., et al. (2020). The Curious Case of Neural Text Degeneration. International Conference on Learning Representations (ICLR).",
        "Husain, H., et al. (2019). CodeSearchNet Challenge: Evaluating the State of Semantic Code Search. arXiv preprint arXiv:1909.09436.",
        "Barke, S., et al. (2022). Grounded Copilot: How Programmers Interact with Code-Generating Models. arXiv preprint arXiv:2206.15000.",
        "Fried, D., et al. (2022). InCoder: A Generative Model for Code Infilling and Synthesis. arXiv preprint arXiv:2204.05999.",
        "Ollama Project Contributors. (2024). Ollama: Get up and running with large language models, locally. GitHub Repository. https://github.com/ollama/ollama",
        "xterm.js Contributors. (2024). xterm.js: A terminal front-end component for the web. GitHub Repository. https://github.com/xtermjs/xterm.js",
      ].map((ref, i) =>
        new Paragraph({
          spacing: { before: 60, after: 60 },
          indent: { left: 720, hanging: 360 },
          children: [new TextRun({ text: `[${i + 1}] ${ref}`, size: 20, font: "Arial" })]
        })
      )

    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/mnt/user-data/outputs/INT428_ProjectReport_NexusAI.docx', buf);
  console.log('Done');
});