import React from 'react';
import { useEditorStore, useUIStore } from '../../store';
import { FilePlus, FolderOpen, Terminal, Sparkles, BookOpen, Code2 } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { openFile } = useEditorStore();
  const { setCommandPaletteOpen } = useUIStore();

  const handleNewFile = () => {
    const id = `untitled-${Date.now()}`;
    openFile({
      id,
      name: 'Untitled',
      path: `/${id}`,
      content: '',
      language: 'plaintext'
    });
  };

  const hotkeys = [
    { label: 'Command Palette', keys: ['⌘', 'K'] },
    { label: 'Quick Open', keys: ['⌘', 'P'] },
    { label: 'Toggle Sidebar', keys: ['⌘', 'B'] },
    { label: 'Toggle Terminal', keys: ['⌘', 'J'] },
    { label: 'Settings', keys: ['⌘', ','] },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-base relative overflow-hidden selection:bg-accent-violet/30">
      {/* Premium Animated Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-violet/10 blur-[120px] animate-[pulse_10s_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-cyan/5 blur-[120px] animate-[pulse_12s_infinite]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-4xl w-full px-12 py-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="w-16 h-16 rounded-3xl bg-surface border border-strong flex items-center justify-center mb-6 shadow-2xl shadow-accent-violet/20 animate-[fadeScaleIn_0.6s_cubic-bezier(0.16,1,0.3,1)]">
            <Sparkles className="text-accent-violet w-8 h-8" />
          </div>
          <h1 className="text-5xl font-ui font-bold text-primary tracking-tight mb-4 animate-[fadeSlideUp_0.8s_cubic-bezier(0.16,1,0.3,1)]">
            NEXUS <span className="text-accent-violet">AI</span>
          </h1>
          <p className="text-secondary text-lg max-w-md leading-relaxed animate-[fadeSlideUp_1s_cubic-bezier(0.16,1,0.3,1)]">
            The next generation of local-first development. 
            Powerfully simple, beautifully intentional.
          </p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16 animate-[fadeSlideUp_1.2s_cubic-bezier(0.16,1,0.3,1)]">
          <WelcomeCard 
            icon={<FilePlus size={20} />} 
            title="New File" 
            desc="Start with a blank canvas" 
            onClick={handleNewFile}
            color="text-accent-violet"
          />
          <WelcomeCard 
            icon={<FolderOpen size={20} />} 
            title="Open Folder" 
            desc="Work on existing code" 
            onClick={() => {}}
            color="text-success"
          />
          <WelcomeCard 
            icon={<Terminal size={20} />} 
            title="Palette" 
            desc="Access all commands" 
            onClick={() => setCommandPaletteOpen(true)}
            color="text-accent-cyan"
          />
        </div>

        {/* Footer / Shortcuts Section */}
        <div className="w-full max-w-2xl pt-8 border-t border-subtle flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 hover:opacity-100 transition-opacity duration-500 animate-[fadeSlideUp_1.4s_cubic-bezier(0.16,1,0.3,1)]">
          <div className="flex items-center gap-6">
            <FooterLink icon={<BookOpen size={14} />} label="Documentation" />
            <FooterLink icon={<Code2 size={14} />} label="Templates" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {hotkeys.slice(0, 3).map((hk, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[12px] text-muted">{hk.label}</span>
                <div className="flex gap-1">
                  {hk.keys.map((k, j) => (
                    <kbd key={j} className="h-5 min-w-[18px] flex items-center justify-center px-1 bg-surface border border-default rounded text-[10px] font-mono text-muted uppercase">
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const WelcomeCard = ({ icon, title, desc, onClick, color }: any) => (
  <button
    onClick={onClick}
    className="group flex flex-col p-5 rounded-2xl bg-surface border border-default hover:border-accent-violet/50 hover:bg-overlay hover:shadow-2xl hover:shadow-accent-violet/5 transition-all duration-300 text-left relative overflow-hidden btn-press"
  >
    <div className={`mb-4 p-2 rounded-xl bg-base border border-subtle inline-flex ${color} group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <div className="text-[14px] font-semibold text-primary mb-1 group-hover:text-accent-violet transition-colors">{title}</div>
    <div className="text-[12px] text-muted leading-snug group-hover:text-secondary transition-colors">{desc}</div>
    
    {/* Subtle gradient flash on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
);

const FooterLink = ({ icon, label }: any) => (
  <a href="#" className="flex items-center gap-2 text-[12px] text-muted hover:text-primary transition-colors">
    {icon} <span>{label}</span>
  </a>
);

