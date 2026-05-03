import { useSettingsStore } from '../store/settings';

const getBaseUrl = () => useSettingsStore.getState().ollamaBaseUrl || 'http://localhost:11434';

export const checkConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(getBaseUrl(), { method: 'GET' });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const fetchModels = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/tags`, { method: 'GET' });
    if (!response.ok) return [];
    const data = await response.json();
    return data.models?.map((m: any) => m.name) || [];
  } catch (error) {
    return [];
  }
};

export interface StreamChatParams {
  model: string;
  prompt: string;
  system?: string;
}

export async function* streamChat({ model, prompt, system }: StreamChatParams): AsyncGenerator<string, void, unknown> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 404) throw new Error('Model not found. Please pull it via Ollama.');
      throw new Error(`HTTP Error: ${response.status}`);
    }

    if (!response.body) throw new Error('ReadableStream not supported.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last partial line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        const parsed = JSON.parse(line);
        if (parsed.response) {
          yield parsed.response;
        }
      }
    }

    // Process anything remaining in the buffer
    if (buffer.trim()) {
      const parsed = JSON.parse(buffer);
      if (parsed.response) {
        yield parsed.response;
      }
    }
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Ollama is offline. Please start the Ollama service on your machine.');
    }
    throw error;
  }
}
