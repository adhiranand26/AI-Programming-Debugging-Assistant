import { useEditorStore } from '../store/editor';
import { useAIStore } from '../store/ai';
import { buildPrompt } from '../services/contextBuilder';
import { streamChat } from '../services/ollama';

const ACTION_PROMPTS: Record<string, string> = {
  'FIX': "Fix the bug or issue in this code. Explain briefly what was wrong and return the corrected code only.",
  'EXPLAIN': "Explain this code clearly. What does it do, how does it work, and are there any important things to know?",
  'OPTIMIZE': "Optimize this code for performance and readability. Show the improved version with a brief note on changes.",
  'GENERATE_TESTS': "Write comprehensive unit tests for this code using the appropriate testing framework. Include edge cases.",
  'GENERATE_DOCS': "Write clear JSDoc/docstring comments for this function or module.",
  'REFACTOR': "Refactor this code to be cleaner and more maintainable. Preserve all existing behavior.",
  'SECURITY_REVIEW': "Review this code for security vulnerabilities. List any issues found and suggest fixes.",
  'PERFORMANCE_REVIEW': "Analyze this code for performance issues. What are the bottlenecks and how to fix them?",
};

export const runCodeAction = async (actionId: string, subContext?: string) => {
  const { openFiles, activeFileId, activeSelection } = useEditorStore.getState();
  const { activeModel, addMessage, updateMessage, setStreaming, setMode } = useAIStore.getState();

  const activeFile = openFiles.find(f => f.id === activeFileId);
  if (!activeFile) return;

  // Set AI mode to code automatically for actions
  setMode('code');

  let actionText = ACTION_PROMPTS[actionId];
  if (actionId === 'CONVERT' && subContext) {
    actionText = `Convert this code to ${subContext}. Maintain equivalent functionality.`;
  }

  if (!actionText) return;

  const userMessageId = `user-${Date.now()}`;
  addMessage({ id: userMessageId, role: 'user', content: `[Action: ${actionId}] ${subContext ? `(${subContext})` : ''}`, timestamp: Date.now() });

  const { prompt, system } = buildPrompt('code', actionText, activeFile, activeSelection, []);

  const assistantMsgId = `assistant-${Date.now()}`;
  addMessage({ id: assistantMsgId, role: 'assistant', content: '', timestamp: Date.now() });
  
  setStreaming(true);

  try {
    const stream = streamChat({ model: activeModel, prompt, system });
    for await (const chunk of stream) {
      updateMessage(assistantMsgId, (prev) => prev + chunk);
      useAIStore.getState().incrementStreamTokens();
    }
  } catch (err: any) {
    updateMessage(assistantMsgId, (prev) => prev + `\n\n**Error:** ${err.message}`);
  } finally {
    setStreaming(false);
  }
};
