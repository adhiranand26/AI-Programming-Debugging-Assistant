
AGENT SKILLS — READ THIS FIRST BEFORE WRITING ANY CODE
You have specialized skills installed in your ~/.agents/skills/ directory. For this project you are required to use the following skills. Do not skip them. Do not start coding until you have read and internalized them.

Skills to activate for this project
frontend-design
Read this skill before writing a single line of UI code. This is your anti-AI-slop enforcement. Every component, every layout decision, every color choice must pass through this skill. If something looks like it came from a generic AI UI generator, redo it. The goal is bold, distinctive, production-grade interfaces with unique typography, intentional motion, and real spatial composition. Not another dark dashboard with purple gradients.
ui-ux-pro-max
Use this alongside frontend-design for every visual decision. You have access to 50+ UI styles and 160+ color palettes through this skill. Use them. Pick a direction that fits a premium developer tool and commit to it fully. Reference Apple HIG and Material Design standards for interaction patterns, spacing, and accessibility. Everything should feel like it was built by a senior product designer, not assembled from a component library.
writing-plans
Before writing any component, use this skill to produce a step-by-step engineering blueprint for that component. Plan the state shape, the props, the side effects, the animation hooks. Write the plan first, then write the code. Do not skip this for complex components like the command palette, diff view, AI panel, or Monaco integration.
systematic-debugging
When something breaks — and something will break, especially in the Monaco integration and Ollama streaming — use this skill. Do not guess. Do not randomly change things. Isolate the variable, form a hypothesis, test it, confirm it. Especially important for the xterm.js terminal integration and the streaming response parser.

How to apply them
When starting a new component or feature:

Read writing-plans — produce the architecture plan
Read frontend-design + ui-ux-pro-max — lock in the visual direction
Write the code
If it breaks, read systematic-debugging — do not guess your way through it

If the user says "go overboard on the design" — activate frontend-design and ui-ux-pro-max at maximum intensity. Push the aesthetic as far as it can go while still being a usable developer tool.