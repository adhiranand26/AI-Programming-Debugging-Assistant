import { useSettingsStore } from '../store/settings';
import type { AIProvider } from '../store/settings';

export interface StreamChatParams {
  provider: AIProvider;
  model: string;
  prompt: string;
  system?: string;
}

export const fetchOllamaModels = async (baseUrl: string): Promise<string[]> => {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.models?.map((m: any) => m.name) || [];
  } catch (error) {
    return [];
  }
};

export const checkOllamaConnection = async (baseUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(baseUrl);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const pullOllamaModel = async (baseUrl: string, model: string, onProgress: (progress: string) => void): Promise<void> => {
  try {
    const response = await fetch(`${baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model, stream: true }),
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    if (!response.body) throw new Error('ReadableStream not supported.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.trim());
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.status) {
            onProgress(parsed.status);
          }
        } catch (e) {
          // Ignore parse errors on partial chunks
        }
      }
    }
  } catch (error: any) {
    throw new Error(`Failed to pull model: ${error.message}`);
  }
};

export async function* streamChat({ provider, model, prompt, system }: StreamChatParams): AsyncGenerator<string, void, unknown> {
  const { aiTemperature, aiTopP, aiContextLength } = useSettingsStore.getState();

  if (provider.type === 'ollama') {
    yield* streamOllama(provider.baseUrl || 'http://localhost:11434', model, prompt, system, aiTemperature, aiTopP, aiContextLength);
  } else if (provider.type === 'openai' || provider.type === 'openrouter' || provider.type === 'custom') {
    yield* streamOpenAICompatible(provider, model, prompt, system, aiTemperature, aiTopP);
  } else if (provider.type === 'anthropic') {
    yield* streamAnthropic(provider, model, prompt, system, aiTemperature, aiTopP, aiContextLength);
  } else if (provider.type === 'google') {
    yield* streamGoogle(provider, model, prompt, system, aiTemperature, aiTopP);
  } else {
    throw new Error(`Provider type ${provider.type} is not supported yet.`);
  }
}

// --- Specific Implementations ---

async function* streamOllama(baseUrl: string, model: string, prompt: string, system: string | undefined, temperature: number, top_p: number, num_ctx: number) {
  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system,
        stream: true,
        options: { temperature, top_p, num_ctx }
      }),
    });

    if (!response.ok) {
      if (response.status === 404) throw new Error('Model not found. Please pull it via Settings.');
      throw new Error(`Ollama Error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Stream not supported');
    const decoder = new TextDecoder();

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        const parsed = JSON.parse(line);
        if (parsed.response) yield parsed.response;
      }
    }
    if (buffer.trim()) {
      const parsed = JSON.parse(buffer);
      if (parsed.response) yield parsed.response;
    }
  } catch (error: any) {
    if (error.name === 'TypeError') throw new Error('Ollama is unreachable. Ensure it is running at the configured URL.');
    throw error;
  }
}

async function* streamOpenAICompatible(provider: AIProvider, model: string, prompt: string, system: string | undefined, temperature: number, top_p: number) {
  const url = provider.baseUrl || 'https://api.openai.com/v1';
  const apiKey = provider.apiKey;
  
  if (!apiKey) throw new Error(`API Key missing for ${provider.name}`);

  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(`${url.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...(provider.type === 'openrouter' && { 'HTTP-Referer': 'https://nexus-ai.local', 'X-Title': 'NEXUS AI' })
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature,
      top_p,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('Invalid API Key.');
    if (response.status === 429) throw new Error('Rate limit exceeded.');
    throw new Error(err.error?.message || `API Error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Stream not supported');
  const decoder = new TextDecoder();

  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }
}

async function* streamAnthropic(provider: AIProvider, model: string, prompt: string, system: string | undefined, temperature: number, top_p: number, max_tokens: number) {
  const url = provider.baseUrl || 'https://api.anthropic.com/v1/messages';
  const apiKey = provider.apiKey;
  
  if (!apiKey) throw new Error(`API Key missing for ${provider.name}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerously-allow-browser': 'true' // Required for client-side requests
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      system,
      max_tokens: max_tokens > 4096 ? 4096 : max_tokens, // Claude 3 limits
      stream: true,
      temperature,
      top_p,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Invalid Anthropic API Key.');
    throw new Error(`Anthropic Error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Stream not supported');
  const decoder = new TextDecoder();

  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            yield parsed.delta.text;
          }
        } catch (e) {}
      }
    }
  }
}

async function* streamGoogle(provider: AIProvider, model: string, prompt: string, system: string | undefined, temperature: number, top_p: number) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${provider.apiKey}`;
  
  if (!provider.apiKey) throw new Error(`API Key missing for ${provider.name}`);

  const contents = [];
  if (system) contents.push({ role: 'user', parts: [{ text: `System Instructions: ${system}\n\nTask: ${prompt}` }] });
  else contents.push({ role: 'user', parts: [{ text: prompt }] });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature, topP: top_p }
    }),
  });

  if (!response.ok) {
    if (response.status === 400) throw new Error('Invalid Gemini API Key or Model.');
    throw new Error(`Google AI Error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Stream not supported');
  const decoder = new TextDecoder();

  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    // Google's stream returns an array of objects but split in chunks. We need a robust parser.
    // For simplicity in MVP, we match "text": "..." within the stream.
    const textMatches = buffer.matchAll(/"text"\s*:\s*"([^"]+)"/g);
    for (const match of textMatches) {
      // Very basic unescaping
      yield match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    
    // Clear buffer after processing what we can
    // This is a naive parsing approach for Gemini SSE-like output, a real implementation would properly parse JSON chunks.
    buffer = ''; 
  }
}
