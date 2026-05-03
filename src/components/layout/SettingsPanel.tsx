import React, { useState } from 'react';
import { useSettingsStore, useUIStore } from '../../store';
import { X, Palette, TerminalSquare, Bot, Keyboard, LayoutTemplate } from 'lucide-react';
import Editor from '@monaco-editor/react';

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`w-8 h-4 rounded-full relative transition-colors duration-150 ${checked ? 'bg-accent-violet' : 'bg-default'}`}
  >
    <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform duration-150 ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
  </button>
);

export const SettingsPanel: React.FC = () => {
  const { activeModal, setActiveModal } = useUIStore();
  const settings = useSettingsStore();
  
  const [activeTab, setActiveTab] = useState<'appearance' | 'editor' | 'ai' | 'keybindings' | 'layout'>('appearance');

  if (activeModal !== 'settings') return null;

  return (
    <div className="absolute inset-0 z-[200] flex animate-[fadeScaleIn_150ms_ease-out]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-base/50 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
      
      {/* Panel */}
      <div className="relative ml-auto w-[600px] h-full bg-panel border-l border-default shadow-2xl flex flex-col font-ui text-primary">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-default shrink-0">
          <h2 className="text-[14px] font-semibold tracking-wide">Settings</h2>
          <button onClick={() => setActiveModal(null)} className="p-1 text-muted hover:text-primary transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-[180px] border-r border-default flex flex-col p-2 gap-1 bg-overlay/30">
            {[
              { id: 'appearance', icon: Palette, label: 'Appearance' },
              { id: 'editor', icon: TerminalSquare, label: 'Editor' },
              { id: 'ai', icon: Bot, label: 'AI Configuration' },
              { id: 'keybindings', icon: Keyboard, label: 'Keybindings' },
              { id: 'layout', icon: LayoutTemplate, label: 'Layout Profiles' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-[12px] font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-overlay text-primary' : 'text-muted hover:text-secondary hover:bg-overlay/50'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-base">
            {activeTab === 'appearance' && (
              <div className="flex flex-col gap-8">
                <section>
                  <h3 className="text-[12px] font-semibold text-secondary uppercase tracking-wider mb-4">Themes</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['sovereign', 'abyss', 'monokai', 'github-dark'].map(t => (
                      <div 
                        key={t}
                        onClick={() => settings.updateSetting('theme', t)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${settings.theme === t ? 'border-accent-violet bg-accent-violet/5' : 'border-default hover:border-hover bg-panel'}`}
                      >
                        <div className="text-[12px] capitalize mb-2">{t.replace('-', ' ')}</div>
                        <div className="flex gap-1">
                          <div className="w-4 h-4 rounded-full bg-base border border-default" />
                          <div className="w-4 h-4 rounded-full bg-panel border border-default" />
                          <div className="w-4 h-4 rounded-full bg-accent-violet border border-default" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                
                <section>
                  <h3 className="text-[12px] font-semibold text-secondary uppercase tracking-wider mb-4">Accent Color</h3>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" min="0" max="360" 
                      value={settings.accentHue} 
                      onChange={(e) => settings.updateSetting('accentHue', parseInt(e.target.value))}
                      className="flex-1 accent-accent-violet"
                    />
                    <div 
                      className="w-8 h-8 rounded-full border border-default shadow-inner" 
                      style={{ backgroundColor: `hsl(${settings.accentHue}, 100%, 71%)` }} 
                    />
                  </div>
                </section>

                <section>
                  <h3 className="text-[12px] font-semibold text-secondary uppercase tracking-wider mb-4">Density</h3>
                  <select 
                    value={settings.density}
                    onChange={(e) => settings.updateSetting('density', e.target.value as any)}
                    className="w-full bg-overlay border border-default rounded-md px-3 py-2 text-[12px] outline-none focus:border-accent-violet"
                  >
                    <option value="compact">Compact (0.8x)</option>
                    <option value="default">Default (1.0x)</option>
                    <option value="comfortable">Comfortable (1.2x)</option>
                  </select>
                </section>
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="flex flex-col gap-6">
                <section className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px]">Format on Save</span>
                    <Toggle checked={settings.formatOnSave} onChange={(val) => settings.updateSetting('formatOnSave', val)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px]">Word Wrap</span>
                    <Toggle checked={settings.wordWrap} onChange={(val) => settings.updateSetting('wordWrap', val)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px]">Show Minimap</span>
                    <Toggle checked={settings.minimap} onChange={(val) => settings.updateSetting('minimap', val)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px]">Font Ligatures</span>
                    <Toggle checked={settings.ligatures} onChange={(val) => settings.updateSetting('ligatures', val)} />
                  </div>
                </section>

                <section className="mt-4">
                  <h3 className="text-[12px] font-semibold text-secondary uppercase tracking-wider mb-4">Typography</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[11px] text-muted mb-1 block">Editor Font Size ({settings.editorFontSize}px)</label>
                      <input type="range" min="10" max="24" value={settings.editorFontSize} onChange={(e) => settings.updateSetting('editorFontSize', parseInt(e.target.value))} className="w-full" />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted mb-1 block">Line Height ({settings.editorLineHeight})</label>
                      <input type="range" min="1" max="3" step="0.1" value={settings.editorLineHeight} onChange={(e) => settings.updateSetting('editorLineHeight', parseFloat(e.target.value))} className="w-full" />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="flex flex-col gap-8 animate-[fadeSlideUp_0.3s_ease-out]">
                {/* Local Models Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                    <h3 className="text-[12px] font-bold text-primary uppercase tracking-widest">Local Models (Ollama)</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-muted uppercase tracking-tight mb-1.5 block">Base URL</label>
                      <input 
                        type="text" 
                        value={settings.ollamaBaseUrl} 
                        onChange={(e) => settings.updateSetting('ollamaBaseUrl', e.target.value)} 
                        placeholder="http://localhost:11434"
                        className="w-full bg-base border border-default rounded-xl px-4 py-2.5 text-[12px] text-primary placeholder-muted outline-none focus:border-accent-cyan/40 transition-all"
                      />
                      <p className="text-[10px] text-muted mt-2 leading-relaxed">Ensure Ollama is running locally. Connection status is shown in the Status Bar.</p>
                    </div>

                    <div className="mt-2">
                      <label className="text-[11px] font-bold text-muted uppercase tracking-tight mb-1.5 block">Pull New Model</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          id="pull-model-input"
                          placeholder="e.g. llama3:8b, mistral"
                          className="flex-1 bg-base border border-default rounded-xl px-4 py-2.5 text-[12px] text-primary placeholder-muted outline-none focus:border-accent-cyan/40 transition-all"
                        />
                        <button 
                          onClick={async () => {
                            const input = document.getElementById('pull-model-input') as HTMLInputElement;
                            const status = document.getElementById('pull-status');
                            if (!input.value.trim() || !status) return;
                            
                            status.innerText = `Pulling ${input.value}...`;
                            try {
                              const { pullOllamaModel } = await import('../../services/aiProvider');
                              await pullOllamaModel(settings.ollamaBaseUrl, input.value.trim(), (progress) => {
                                status.innerText = progress;
                              });
                              status.innerText = `Successfully pulled ${input.value}`;
                              input.value = '';
                            } catch (err: any) {
                              status.innerText = `Error: ${err.message}`;
                            }
                          }}
                          className="px-4 py-2 bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 rounded-xl text-[12px] font-bold hover:bg-accent-cyan/20 transition-all whitespace-nowrap btn-press"
                        >
                          Pull Model
                        </button>
                      </div>
                      <p id="pull-status" className="text-[10px] text-accent-cyan mt-2 leading-relaxed h-3 empty:hidden"></p>
                    </div>
                  </div>
                </section>

                <div className="h-[1px] bg-default" />

                {/* API Providers Section */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-violet shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
                      <h3 className="text-[12px] font-bold text-primary uppercase tracking-widest">Remote Models (API Providers)</h3>
                    </div>
                    <button 
                      onClick={() => {
                        const id = `provider-${Date.now()}`;
                        settings.addProvider({ id, type: 'openai', name: 'New Provider' });
                      }}
                      className="px-3 py-1 bg-accent-violet/10 text-accent-violet border border-accent-violet/20 rounded-lg text-[10px] font-bold uppercase hover:bg-accent-violet/20 transition-all"
                    >
                      + Add Provider
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    {settings.providers.length === 0 ? (
                      <div className="text-[12px] text-muted text-center py-6 border border-dashed border-default rounded-xl">
                        No remote providers added. Add one to use cloud models.
                      </div>
                    ) : (
                      settings.providers.map(provider => (
                        <div key={provider.id} className="p-4 bg-overlay border border-default rounded-xl flex flex-col gap-3 relative group">
                          <button 
                            onClick={() => settings.deleteProvider(provider.id)}
                            className="absolute top-3 right-3 text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X size={14} />
                          </button>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-muted uppercase tracking-tight mb-1 block">Provider Type</label>
                              <select 
                                value={provider.type}
                                onChange={(e) => settings.updateProvider(provider.id, { type: e.target.value as any, name: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1) })}
                                className="w-full bg-base border border-default rounded-lg px-3 py-2 text-[12px] text-primary outline-none focus:border-accent-violet/40 transition-all"
                              >
                                <option value="openai">OpenAI</option>
                                <option value="anthropic">Anthropic</option>
                                <option value="google">Google Gemini</option>
                                <option value="openrouter">OpenRouter</option>
                                <option value="custom">Custom Endpoint</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-muted uppercase tracking-tight mb-1 block">Display Name</label>
                              <input 
                                type="text"
                                value={provider.name}
                                onChange={(e) => settings.updateProvider(provider.id, { name: e.target.value })}
                                className="w-full bg-base border border-default rounded-lg px-3 py-2 text-[12px] text-primary outline-none focus:border-accent-violet/40 transition-all"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-muted uppercase tracking-tight mb-1 block">API Key <span className="text-[9px] opacity-60 font-normal">(Stored locally)</span></label>
                              <input 
                                type="password"
                                value={provider.apiKey || ''}
                                onChange={(e) => settings.updateProvider(provider.id, { apiKey: e.target.value })}
                                placeholder="sk-..."
                                className="w-full bg-base border border-default rounded-lg px-3 py-2 text-[12px] text-primary outline-none focus:border-accent-violet/40 transition-all"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-muted uppercase tracking-tight mb-1 block">Model Name</label>
                                <input 
                                  type="text"
                                  value={provider.defaultModel || ''}
                                  onChange={(e) => settings.updateProvider(provider.id, { defaultModel: e.target.value })}
                                  placeholder="e.g. gpt-4o"
                                  className="w-full bg-base border border-default rounded-lg px-3 py-2 text-[12px] text-primary outline-none focus:border-accent-violet/40 transition-all"
                                />
                              </div>
                              {(provider.type === 'custom' || provider.type === 'openai') && (
                                <div>
                                  <label className="text-[10px] font-bold text-muted uppercase tracking-tight mb-1 block">Custom Base URL (Optional)</label>
                                  <input 
                                    type="text"
                                    value={provider.baseUrl || ''}
                                    onChange={(e) => settings.updateProvider(provider.id, { baseUrl: e.target.value })}
                                    placeholder="https://api.openai.com/v1"
                                    className="w-full bg-base border border-default rounded-lg px-3 py-2 text-[12px] text-primary outline-none focus:border-accent-violet/40 transition-all"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <div className="h-[1px] bg-default" />

                {/* Inference Parameters */}
                <section>
                  <h3 className="text-[12px] font-bold text-muted uppercase tracking-widest mb-6">Inference Parameters</h3>
                  <div className="flex flex-col gap-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[11px] font-bold text-secondary uppercase tracking-tight">Temperature</label>
                        <span className="text-[11px] font-mono text-accent-cyan">{settings.aiTemperature}</span>
                      </div>
                      <input type="range" min="0" max="2" step="0.1" value={settings.aiTemperature} onChange={(e) => settings.updateSetting('aiTemperature', parseFloat(e.target.value))} className="w-full accent-accent-cyan" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-secondary uppercase tracking-tight mb-2 block">Context Length</label>
                      <select 
                        value={settings.aiContextLength}
                        onChange={(e) => settings.updateSetting('aiContextLength', parseInt(e.target.value))}
                        className="w-full bg-base border border-default rounded-xl px-4 py-2.5 text-[12px] text-primary outline-none focus:border-accent-cyan/40 transition-all appearance-none"
                      >
                        <option value="4096">4096 tokens</option>
                        <option value="8192">8192 tokens</option>
                        <option value="16384">16384 tokens</option>
                        <option value="32768">32768 tokens</option>
                      </select>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'keybindings' && (
              <div className="flex flex-col gap-4 h-full">
                <select 
                  value={settings.keybindingProfile}
                  onChange={(e) => settings.updateSetting('keybindingProfile', e.target.value as any)}
                  className="w-full bg-overlay border border-default rounded-md px-3 py-2 text-[12px] outline-none focus:border-accent-violet"
                >
                  <option value="default">NEXUS Default</option>
                  <option value="vscode">VS Code</option>
                  <option value="vim">Vim</option>
                  <option value="emacs">Emacs</option>
                </select>
                
                <div className="flex-1 border border-default rounded-lg overflow-hidden mt-2">
                  <Editor
                    language="json"
                    theme="vs-dark"
                    value={settings.customKeybindings}
                    onChange={(val) => settings.updateSetting('customKeybindings', val || '')}
                    options={{
                      minimap: { enabled: false },
                      padding: { top: 12 },
                      fontSize: 12,
                    }}
                  />
                </div>
              </div>
            )}
            
            {activeTab === 'layout' && (
              <div className="flex items-center justify-center h-full text-muted text-[13px] text-center max-w-xs mx-auto">
                Layout profiles will be available in the next version.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
