import React from 'react';
import { Files, Search, GitBranch, Settings } from 'lucide-react';
import { useLayoutStore, useUIStore } from '../../store';

export const ActivityBar: React.FC = () => {
  const { activeSidebarTab, setActiveSidebarTab } = useLayoutStore();

  const tabs = [
    { id: 'files', icon: Files },
    { id: 'search', icon: Search },
    { id: 'git', icon: GitBranch },
  ] as const;

  return (
    <div className="w-[48px] h-full flex flex-col items-center justify-between py-4 bg-base border-r border-default flex-shrink-0 z-10">
      <div className="flex flex-col gap-4 w-full items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSidebarTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSidebarTab(tab.id)}
              className={`
                w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 relative group btn-press
                ${isActive 
                  ? 'bg-accent-violet/15 text-accent-violet border border-accent-violet/20 shadow-lg shadow-accent-violet/5' 
                  : 'text-muted hover:text-secondary hover:bg-surface'}
              `}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <div className="absolute left-[-12px] w-1 h-5 bg-accent-violet rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <button 
          onClick={() => useUIStore.getState().setActiveModal('settings')}
          className="w-9 h-9 rounded-xl text-muted hover:text-secondary hover:bg-surface transition-all duration-300 flex items-center justify-center btn-press"
        >
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
};
