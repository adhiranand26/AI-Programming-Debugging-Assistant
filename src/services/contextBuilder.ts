import type { FileTab } from '../store/editor';

const approximateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

export interface PromptContext {
  prompt: string;
  system: string;
  estimatedTokens: number;
}

export const buildPrompt = (
  mode: 'chat' | 'code',
  userMessage: string,
  activeFile: FileTab | null,
  selection: string | null,
  pinnedFiles: FileTab[]
): PromptContext => {
  let prompt = '';
  let system = '';

  if (mode === 'chat') {
    system = "You are a helpful, brilliant AI assistant inside a developer's IDE. Respond directly and concisely.";
    prompt = userMessage;
    
    // Add pinned files context if any
    if (pinnedFiles.length > 0) {
      prompt += '\n\nFor context, here are some related files:\n';
      pinnedFiles.forEach(f => {
        prompt += `\n--- ${f.name} ---\n\`\`\`${f.language || 'text'}\n${f.content}\n\`\`\`\n`;
      });
    }
  } else {
    system = "You are an expert developer assistant integrated directly into an IDE. You provide production-grade, highly optimized code. When modifying code, return the new complete implementation inside a code block, but keep explanations minimal.";
    
    // Build context
    if (pinnedFiles.length > 0) {
      prompt += 'Context Files:\n';
      pinnedFiles.forEach(f => {
        prompt += `\n--- ${f.name} ---\n\`\`\`${f.language || 'text'}\n${f.content}\n\`\`\`\n`;
      });
      prompt += '\n';
    }

    if (activeFile) {
      prompt += `Active File: ${activeFile.name}\n\`\`\`${activeFile.language || 'text'}\n${activeFile.content}\n\`\`\`\n\n`;
      if (selection && selection.trim() !== '') {
        prompt += `User's Current Selection:\n\`\`\`\n${selection}\n\`\`\`\n\n`;
      }
    }

    prompt += `Task: ${userMessage}`;
  }

  const totalText = prompt + system;
  const estimatedTokens = approximateTokens(totalText);

  return { prompt, system, estimatedTokens };
};
