import React, { useEffect, useRef, useState } from 'react';
import { useLayoutStore, useAIStore, useEditorStore, useSettingsStore, useUIStore } from '../../store';
import { Send, Trash2, Play, Copy, Sparkles, Command, ChevronDown, Check, Settings } from 'lucide-react';
import { checkOllamaConnection, fetchOllamaModels, streamChat } from '../../services/aiProvider';
import { buildPrompt } from '../../services/contextBuilder';
import { PulsePanel } from './PulsePanel';

// ... (Helper Components like TypingIndicator and MessageBlock remain mostly unchanged)
const TypingIndicator = () => (
  <div className="flex items-center gap-2 p-4 w-fit bg-surface border border-default rounded-2xl rounded-tl-sm animate-[fadeSlideUp_0.3s_ease-out]">
    <div className="flex gap-1">
      <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan/40 animate-[bounce_1s_infinite_0ms]" />
      <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan/40 animate-[bounce_1s_infinite_200ms]" />
      <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan/40 animate-[bounce_1s_infinite_400ms]" />
    </div>
  </div>
);

const MessageBlock = ({ content, role, isStreaming }: { content: string; role: 'user' | 'assistant'; isStreaming?: boolean }) => {
  const parts = content.split(/(```[\s\S]*?```)/g);
  const { setDiffState, activeFileId, openFiles } = useEditorStore();
  const activeFile = openFiles.find(f => f.id === activeFileId);

  return (
    <div className={`flex flex-col gap-2.5 group animate-[fadeSlideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] ${role === 'user' ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-2 px-1.5">
        <span className="text-[10px] font-mono font-bold text-muted uppercase tracking-[0.2em] opacity-50">
          {role === 'user' ? 'You' : 'Nexus AI'}
        </span>
      </div>

      <div className={`
        max-w-[94%] p-4 rounded-2xl text-[13px] leading-relaxed relative
        ${role === 'user' 
          ? 'bg-accent-violet/10 border border-accent-violet/20 text-primary rounded-tr-sm shadow-sm' 
          : 'bg-surface border border-default text-secondary rounded-tl-sm shadow-md group-hover:border-accent-cyan/30 transition-all duration-300'}
      `}>
        {parts.map((part, i) => {
          if (part.startsWith('```')) {
            const code = part.replace(/```(\w+)?\n?/, '').replace(/```$/, '');
            const lang = part.match(/```(\w+)?/)?.[1] || 'code';
            
            return (
              <div key={i} className="my-4 first:mt-0 last:mb-0 rounded-xl overflow-hidden border border-default bg-base shadow-lg group/code">
                <div className="flex items-center justify-between px-3 py-2 bg-panel border-b border-default">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider">{lang}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigator.clipboard.writeText(code)}
                      className="p-1.5 rounded-md hover:bg-surface hover:text-primary transition-all active:scale-90"
                      title="Copy code"
                    >
                      <Copy size={14} />
                    </button>
                    {activeFile && (
                      <button 
                        onClick={() => setDiffState({
                          active: true,
                          originalContent: activeFile.content,
                          modifiedContent: code,
                          filename: activeFile.name,
                          fileId: activeFile.id
                        })}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-all active:scale-95 text-[10px] font-bold uppercase"
                      >
                        <Play size={10} fill="currentColor" /> Diff
                      </button>
                    )}
                  </div>
                </div>
                <pre className="p-4 overflow-x-auto no-scrollbar font-mono text-[12.5px] text-primary leading-normal bg-[#050507]">
                  <code>{code}</code>
                </pre>
              </div>
            );
          } else {
            return (
              <div key={i} className="whitespace-pre-wrap break-words prose prose-invert prose-sm max-w-none mb-3 last:mb-0">
                {part}
                {isStreaming && i === parts.length - 1 && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-accent-cyan animate-[pulse_0.8s_infinite] vertical-middle" />
                )}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export const AIPanel: React.FC = () => {
  const { aiPanelWidth } = useLayoutStore();
  const { 
    messages, mode, activeModel, models, isStreaming, isOllamaConnected,
    addMessage, updateMessage, clearMessages, setMode, setActiveModel, setModels, setOllamaConnected, setStreaming
  } = useAIStore();
  
  const { providers, activeProviderId, setActiveProvider, ollamaBaseUrl } = useSettingsStore();
  
  const { openFiles, activeFileId, activeSelection } = useEditorStore();
  const activeFile = openFiles.find(f => f.id === activeFileId) || null;

  const [input, setInput] = useState('');
  const [showModels, setShowModels] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll Ollama status and models
  useEffect(() => {
    const initOllama = async () => {
      const connected = await checkOllamaConnection(ollamaBaseUrl);
      setOllamaConnected(connected);
      if (connected) {
        const availableModels = await fetchOllamaModels(ollamaBaseUrl);
        setModels(availableModels);
        if (availableModels.length > 0 && !activeProviderId && !activeModel) {
          setActiveModel(availableModels[0]);
        }
      }
    };
    initOllama();
    const interval = setInterval(initOllama, 10000);
    return () => clearInterval(interval);
  }, [ollamaBaseUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const getActiveProviderDetails = () => {
    if (activeProviderId) {
      const provider = providers.find(p => p.id === activeProviderId);
      if (provider) return { provider, model: provider.defaultModel || activeModel };
    }
    return { provider: { id: 'ollama', type: 'ollama', name: 'Local Ollama', baseUrl: ollamaBaseUrl }, model: activeModel };
  };

  const handleSubmit = async () => {
    if (!input.trim() || isStreaming) return;

    const { provider, model } = getActiveProviderDetails();
    if (!model && provider.type === 'ollama') {
      alert("No local model selected. Please select one.");
      return;
    }

    const userText = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    addMessage({ id: `user-${Date.now()}`, role: 'user', content: userText, timestamp: Date.now() });

    const assistantMsgId = `assistant-${Date.now()}`;
    addMessage({ id: assistantMsgId, role: 'assistant', content: '', timestamp: Date.now() });
    
    setStreaming(true);

    try {
      const { prompt, system } = buildPrompt(mode, userText, activeFile, activeSelection, []);
      const stream = streamChat({ provider: provider as any, model, prompt, system });
      for await (const chunk of stream) {
        updateMessage(assistantMsgId, (prev) => prev + chunk);
      }
    } catch (err: any) {
      updateMessage(assistantMsgId, (prev) => prev + `\n\n**Error:** ${err.message}`);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div 
      style={{ width: `${aiPanelWidth}px` }} 
      className="h-full bg-panel flex-shrink-0 flex flex-col border-l border-default relative font-ui selection:bg-accent-cyan/30"
    >
      <PulsePanel />

      {/* Header */}
      <div className="h-[52px] flex-shrink-0 flex items-center justify-between px-5 border-b border-default bg-panel/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-2.5 h-2.5 rounded-full ${isOllamaConnected ? 'bg-accent-cyan shadow-[0_0_12px_rgba(6,182,212,0.6)]' : 'bg-warning shadow-[0_0_12px_rgba(245,158,11,0.4)]'}`} />
            {isOllamaConnected && <div className="absolute inset-0 rounded-full bg-accent-cyan animate-ping opacity-20" />}
          </div>
          <span className="text-[13px] font-bold text-primary tracking-tight">AI ASSISTANT</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-surface border border-default rounded-xl">
          <button 
            onClick={() => setMode('chat')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${mode === 'chat' ? 'bg-active text-primary shadow-sm' : 'text-muted hover:text-secondary'}`}
          >
            Chat
          </button>
          <button 
            onClick={() => setMode('code')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${mode === 'code' ? 'bg-active text-primary shadow-sm' : 'text-muted hover:text-secondary'}`}
          >
            Code
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 scrollable-hover relative">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center animate-[fadeSlideUp_0.4s_ease-out]">
            <div className="w-16 h-16 rounded-[24px] bg-surface border border-default flex items-center justify-center shadow-xl">
              <Sparkles className="text-accent-cyan animate-pulse" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-primary tracking-tight">How can I help you today?</h3>
              <p className="text-[13px] text-muted max-w-[240px] leading-relaxed">
                Ask me to explain code, find bugs, or refactor entire files.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-2.5 w-full max-w-[280px]">
              <SuggestionCard text="Explain this file" onClick={() => setInput('Explain how this file works')} />
              <SuggestionCard text="Find potential bugs" onClick={() => setInput('Scan this file for bugs or logic errors')} />
              <SuggestionCard text="Optimize performance" onClick={() => setInput('How can I make this code faster?')} />
            </div>

            <button 
              onClick={() => useUIStore.getState().setActiveModal('settings')}
              className="mt-4 text-[11px] font-bold text-muted hover:text-accent-cyan transition-colors flex items-center gap-2"
            >
              <Settings size={12} /> Configure AI Models & Keys
            </button>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <MessageBlock key={msg.id} content={msg.content} role={msg.role as 'user' | 'assistant'} isStreaming={isStreaming && msg.id === messages[messages.length-1].id} />
            ))}
            {isStreaming && messages[messages.length-1].role === 'user' && <TypingIndicator />}
            <div ref={messagesEndRef} className="h-8" />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-5 bg-panel border-t border-default">
        <div className="relative bg-surface border border-default rounded-2xl focus-within:border-accent-cyan/50 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.05)] transition-all duration-300">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
            placeholder="Type a message... (⌘↵ to send)"
            className="w-full bg-transparent border-none focus:ring-0 text-[13px] text-primary placeholder-muted p-4 pr-12 min-h-[56px] max-h-[200px] resize-none no-scrollbar"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button 
              onClick={handleSubmit}
              disabled={!input.trim() || isStreaming}
              className={`p-2 rounded-xl transition-all active:scale-90 ${input.trim() && !isStreaming ? 'bg-accent-cyan text-base shadow-lg shadow-accent-cyan/20 hover:scale-105' : 'bg-active text-muted'}`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex items-center gap-3 relative">
            <button 
              onClick={() => setShowModels(!showModels)}
              className="flex items-center gap-2 text-[11px] font-bold text-muted hover:text-secondary transition-colors btn-press"
            >
              <Command size={12} /> 
              {activeProviderId 
                ? `${providers.find(p => p.id === activeProviderId)?.name} (${providers.find(p => p.id === activeProviderId)?.defaultModel || 'No model'})`
                : (activeModel || 'Select Model')} 
              <ChevronDown size={12} />
            </button>
            {showModels && (
              <div className="absolute bottom-8 left-0 w-64 bg-overlay border border-strong rounded-2xl shadow-2xl py-2 z-50 animate-[fadeSlideUp_0.2s_ease-out] overflow-hidden">
                {/* Local Models */}
                <div className="px-3 py-1.5 text-[10px] font-bold text-muted uppercase tracking-widest bg-base/50">Local Models</div>
                {models.length === 0 ? (
                  <div className="px-4 py-2 text-[11px] text-muted italic">No models installed</div>
                ) : (
                  models.map(m => (
                    <button 
                      key={`local-${m}`}
                      onClick={() => { setActiveProvider(null); setActiveModel(m); setShowModels(false); }}
                      className="w-full text-left px-4 py-2 text-[12px] text-secondary hover:bg-active hover:text-primary flex items-center justify-between transition-colors"
                    >
                      <span>{m} <span className="text-[10px] text-muted opacity-50 ml-1">Ollama</span></span>
                      {!activeProviderId && m === activeModel && <Check size={14} className="text-accent-cyan" />}
                    </button>
                  ))
                )}
                
                {/* Remote Providers */}
                <div className="px-3 py-1.5 text-[10px] font-bold text-muted uppercase tracking-widest bg-base/50 mt-2 border-t border-default">Remote Providers</div>
                {providers.length === 0 ? (
                  <div className="px-4 py-2 text-[11px] text-muted italic">No providers added</div>
                ) : (
                  providers.map(p => (
                    <button 
                      key={`remote-${p.id}`}
                      onClick={() => { setActiveProvider(p.id); setActiveModel(p.defaultModel || ''); setShowModels(false); }}
                      className="w-full text-left px-4 py-2 text-[12px] text-secondary hover:bg-active hover:text-primary flex items-center justify-between transition-colors"
                    >
                      <div className="flex flex-col">
                        <span>{p.name}</span>
                        <span className="text-[10px] text-muted opacity-60">{p.defaultModel || 'Set model in settings'}</span>
                      </div>
                      {activeProviderId === p.id && <Check size={14} className="text-accent-cyan" />}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <button 
            onClick={clearMessages}
            className="text-[11px] font-bold text-muted hover:text-error transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={12} /> Clear
          </button>
        </div>
      </div>
    </div>
  );
};

const SuggestionCard = ({ text, onClick }: { text: string; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="px-4 py-3 rounded-xl bg-surface border border-default hover:border-accent-cyan/40 hover:bg-active text-[12px] text-secondary hover:text-primary transition-all text-left btn-press"
  >
    {text}
  </button>
);
