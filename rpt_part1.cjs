const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, LevelFormat, BorderStyle, WidthType,
  ShadingType, PageBreak, ExternalHyperlink, Header, Footer, PageNumber
} = require('docx');
const fs = require('fs');

const HC = "1A3A6B", SC = "2E5FAA", BC = "2C3E7A", LB = "EEF2FA";
const bdr = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: bdr, bottom: bdr, left: bdr, right: bdr };

function h1(t) { return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 140 }, children: [new TextRun({ text: t, bold: true, size: 28, color: HC, font: "Arial" })] }); }
function h2(t) { return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 }, children: [new TextRun({ text: t, bold: true, size: 24, color: SC, font: "Arial" })] }); }
function p(t) { return new Paragraph({ spacing: { before: 80, after: 120, line: 360 }, alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: t, size: 22, font: "Arial" })] }); }
function bullet(t) { return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: t, size: 22, font: "Arial" })] }); }
function numbered(t) { return new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { before: 40, after: 40 }, children: [new TextRun({ text: t, size: 22, font: "Arial" })] }); }
function bold(t) { return new TextRun({ text: t, bold: true, size: 22, font: "Arial" }); }
function run(t) { return new TextRun({ text: t, size: 22, font: "Arial" }); }
function pb() { return new Paragraph({ children: [new PageBreak()] }); }
function ctr(t, sz, opts={}) { return new Paragraph({ spacing: { before: opts.before||20, after: opts.after||20 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, size: sz, font: "Arial", bold: opts.bold||false, color: opts.color||"000000", italics: opts.italics||false })] }); }
function screenshot(label) { return new Paragraph({ spacing: { before: 120, after: 120 }, border: { top: { style: BorderStyle.DASHED, size: 4, color: "999999" }, bottom: { style: BorderStyle.DASHED, size: 4, color: "999999" }, left: { style: BorderStyle.DASHED, size: 4, color: "999999" }, right: { style: BorderStyle.DASHED, size: 4, color: "999999" } }, children: [new TextRun({ text: `[ SCREENSHOT: ${label} ]`, size: 20, color: "888888", italics: true, font: "Arial" })] }); }
function code(t) { return new Paragraph({ spacing: { before: 40, after: 40 }, shading: { fill: "F4F4F4", type: ShadingType.CLEAR }, children: [new TextRun({ text: t, font: "Courier New", size: 18, color: "1A1A1A" })] }); }
function trow(l, v, shade) { return new TableRow({ children: [ new TableCell({ borders, width: { size: 3200, type: WidthType.DXA }, shading: { fill: shade?LB:"FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [bold(l)] })] }), new TableCell({ borders, width: { size: 6160, type: WidthType.DXA }, shading: { fill: shade?LB:"FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [run(v)] })] }) ] }); }
function makeTable(rows) { return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [3200, 6160], rows: rows.map((r, i) => trow(r[0], r[1], i % 2 === 0)) }); }

// ─── COVER PAGE ───
const cover = [
  ctr("Lovely Professional University", 36, { bold: true, color: HC, before: 600 }),
  ctr("Department of Computer Science and Engineering", 24, { color: "444444", before: 100 }),
  ctr("Course: INT428 — Domain-Specific Generative AI Chatbot", 22, { color: "555555", italics: true, after: 280 }),
  new Paragraph({ spacing: { before: 280, after: 40 }, alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 8, color: BC } }, children: [] }),
  ctr("PROJECT REPORT", 28, { bold: true, color: "666666", before: 120, after: 60 }),
  ctr("AI-Powered Programming and Debugging Assistant", 40, { bold: true, color: HC, before: 40, after: 160 }),
  ctr("(Nexus AI)", 28, { bold: true, color: SC, after: 80 }),
  ctr("A Local-First, Offline-Capable Intelligent IDE for Code Assistance, Debugging, and Explanation", 22, { color: "555555", italics: true, after: 320 }),
  ctr("Submitted by", 22, { color: "666666", before: 120 }),
  ctr("Adhira Nand", 26, { bold: true, color: HC }),
  ctr("UID: ____________________", 22, {}),
  ctr("Branch & Semester: CSE — 6th Semester", 22, {}),
  ctr("Guide / Faculty: ____________________", 22, { after: 200 }),
  ctr("Academic Year: 2024–2025", 20, { color: "777777", before: 80 }),
  new Paragraph({ spacing: { before: 10 }, alignment: AlignmentType.CENTER, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BC } }, children: [] }),
  pb(),
];

// ─── CERTIFICATE PAGE ───
const certificate = [
  ctr("CERTIFICATE", 32, { bold: true, color: HC, before: 400, after: 200 }),
  new Paragraph({ spacing: { before: 200, after: 200 }, alignment: AlignmentType.CENTER, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BC } }, children: [] }),
  p("This is to certify that the project report entitled \"AI-Powered Programming and Debugging Assistant (Nexus AI)\" submitted by Adhira Nand, a student of B.Tech Computer Science and Engineering at Lovely Professional University, Phagwara, Punjab, is a bonafide record of work carried out under the course INT428 — Domain-Specific Generative AI Chatbot during the academic year 2024–2025."),
  p("The project has been completed satisfactorily and the report is hereby approved for submission as a partial fulfillment of the requirements for the award of the degree of Bachelor of Technology in Computer Science and Engineering."),
  new Paragraph({ spacing: { before: 400 }, children: [] }),
  new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "Date: ____________________", size: 22, font: "Arial" })] }),
  new Paragraph({ spacing: { before: 200 }, children: [] }),
  new Paragraph({ spacing: { before: 100 }, alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Signature of Guide / Faculty", size: 22, font: "Arial" })] }),
  new Paragraph({ spacing: { before: 40 }, alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "____________________", size: 22, font: "Arial" })] }),
  pb(),
];

// ─── ACKNOWLEDGEMENT ───
const acknowledgement = [
  ctr("ACKNOWLEDGEMENT", 32, { bold: true, color: HC, before: 200, after: 200 }),
  new Paragraph({ spacing: { before: 100, after: 200 }, alignment: AlignmentType.CENTER, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BC } }, children: [] }),
  p("I would like to express my sincere gratitude to Lovely Professional University for providing the academic environment and resources that made this project possible. The infrastructure, laboratory facilities, and access to computing resources were instrumental in the development and testing of the Nexus AI system."),
  p("I am deeply thankful to my faculty guide for their invaluable guidance, constructive feedback, and continuous encouragement throughout the duration of this project. Their expertise in artificial intelligence and software engineering helped shape the direction of this work and ensured its academic rigor."),
  p("I also extend my appreciation to the open-source community, particularly the developers of Ollama, Meta AI (for the LLaMA model family), Microsoft (for the Monaco Editor), and the React ecosystem contributors, whose work forms the technological foundation of this project."),
  p("Finally, I would like to thank my peers and family for their unwavering support and motivation during the course of this project."),
  new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Adhira Nand", bold: true, size: 22, font: "Arial" })] }),
  pb(),
];

// ─── TABLE OF CONTENTS ───
const tocEntries = [
  ["1.", "Abstract", "4"], ["2.", "Introduction", "5"], ["3.", "Problem Statement", "7"],
  ["4.", "Objectives of the Project", "8"], ["5.", "Proposed System and Methodology", "9"],
  ["6.", "System Architecture", "11"], ["7.", "Data Flow", "13"], ["8.", "Technologies Used", "14"],
  ["9.", "Model Details and Configuration", "17"], ["10.", "Prompt Engineering", "19"],
  ["11.", "Implementation and Working", "21"], ["12.", "Results and Sample Outputs", "23"],
  ["13.", "Advantages", "26"], ["14.", "Limitations", "27"], ["15.", "Future Scope", "28"],
  ["16.", "Conclusion", "29"], ["17.", "References", "30"], ["18.", "GitHub Repository", "31"],
];
const toc = [
  ctr("TABLE OF CONTENTS", 28, { bold: true, color: HC, before: 40, after: 20 }),
  new Paragraph({ spacing: { before: 0, after: 240 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BC } }, children: [] }),
  ...tocEntries.map(([num, title, pg]) => new Paragraph({ spacing: { before: 60, after: 60 }, tabStops: [{ type: "right", position: 9000, leader: "dot" }], children: [ new TextRun({ text: `${num}   ${title}`, size: 22, font: "Arial" }), new TextRun({ text: "\t" + pg, size: 22, font: "Arial" }) ] })),
  pb(),
];

// ─── ABSTRACT ───
const abstract = [
  h1("1. Abstract"),
  p("The rapid proliferation of generative artificial intelligence has opened unprecedented avenues for domain-specific intelligent assistance. This report presents the design, architecture, and implementation of an AI-Powered Programming and Debugging Assistant — a local-first, offline-capable development environment that integrates a large language model (LLM) backend with a professional-grade code editor interface. Unlike cloud-dependent AI coding tools, the proposed system leverages Ollama as its AI inference engine, enabling all model computations to occur entirely on the user's local machine without transmitting code or queries to any remote server."),
  p("The system incorporates a Monaco-based code editor, an AI conversational panel, an integrated terminal, and a command palette — collectively forming a unified intelligent development environment (IDE). Key functionalities include contextual code explanation, automated bug detection and fixing, unit test generation, documentation synthesis, and language-aware response control. The assistant is engineered with carefully configured model parameters — specifically temperature (0.2) and top-p (0.85) — to ensure technically precise, deterministic, and domain-constrained outputs suitable for a software engineering context."),
  p("Prompt engineering constitutes a central pillar of the system, with a structured system prompt that assigns the model a strict role, constrains its domain of operation, and governs response formatting. The results demonstrate that the system reliably assists programmers with debugging, code review, and explanation tasks across multiple programming languages, achieving consistently accurate and readable outputs. The project contributes to the growing field of privacy-preserving AI developer tools by demonstrating the viability of fully offline, LLM-augmented integrated development environments."),
  pb(),
];

// ─── INTRODUCTION ───
const intro = [
  h1("2. Introduction"),
  h2("2.1 Background of AI in Coding Assistants"),
  p("The integration of artificial intelligence into software development workflows has undergone a fundamental transformation over the past several years. From early rule-based linters and static analysis tools, the field has progressed to large language model (LLM)-based systems capable of generating, explaining, refactoring, and debugging code with a degree of contextual understanding previously unattainable through automated means. Pioneering systems such as GitHub Copilot, Amazon CodeWhisperer, and Tabnine introduced developers to the concept of AI pair programming, wherein intelligent suggestions are surfaced inline within the editing environment."),
  p("These systems, while demonstrably effective, share a common architectural dependency: they route all user queries and code snippets to remote cloud-based inference infrastructure. This model raises significant concerns regarding intellectual property confidentiality, data sovereignty, and operational resilience in environments with limited or unreliable network connectivity. The emergence of high-quality open-weight language models — such as LLaMA 3, Mistral, and DeepSeek Coder — combined with efficient local inference frameworks like Ollama, has made it technically and economically feasible to operate AI coding assistants entirely within a developer's local compute environment."),
  h2("2.2 Importance of Privacy and Local AI"),
  p("Privacy considerations in AI-assisted development are of paramount importance, particularly in enterprise and educational settings. Proprietary code, credentials inadvertently embedded within source files, and sensitive algorithmic logic represent categories of data that developers and organizations are rightfully reluctant to transmit to external servers. Furthermore, academic institutions often operate within strict regulatory frameworks governing student data, which may prohibit the use of cloud-based AI APIs without explicit institutional agreements."),
  p("Local AI inference addresses these concerns holistically. By confining all model computation to the developer's own hardware, the system eliminates network latency as a source of jitter, removes dependency on third-party API availability, and ensures that no user-generated data ever traverses an external network boundary. The resulting tool is not merely a privacy-preserving variant of existing cloud-based solutions; it represents a qualitatively different product category — one where offline functionality, instant responsiveness, and user autonomy are first-class design requirements rather than optional features."),
  p("This project operationalizes these principles by constructing a complete, production-quality AI-assisted IDE that runs entirely on the local machine, delivering the capabilities of state-of-the-art AI coding assistants without any of the associated privacy trade-offs."),
  pb(),
];

module.exports = { cover, certificate, acknowledgement, toc, abstract, intro, h1, h2, p, bullet, numbered, bold, run, pb, ctr, screenshot, code, makeTable, trow };
