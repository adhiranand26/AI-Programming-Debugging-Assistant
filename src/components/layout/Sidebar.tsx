import React, { useState } from 'react';
import { useLayoutStore } from '../../store';
import { FolderOpen, Search, GitBranch, ChevronRight } from 'lucide-react';

const TAB_LABELS: Record<string, string> = {
  files: 'Explorer',
  search: 'Search',
  git: 'Source Control',
  outline: 'Outline',
};

export const Sidebar: React.FC = () => {
  const { sidebarWidth, activeSidebarTab } = useLayoutStore();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div 
      style={{ width: `${sidebarWidth}px` }} 
      className="h-full bg-surface flex-shrink-0 flex flex-col border-r border-default"
    >
      {/* Header */}
      <div className="h-[52px] flex items-center px-5 border-b border-default bg-panel/30 backdrop-blur-sm">
        <span className="font-ui text-[11px] font-bold text-muted uppercase tracking-[0.25em]">
          {TAB_LABELS[activeSidebarTab] || activeSidebarTab}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 scrollable-hover">
        {activeSidebarTab === 'files' && (
          <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-6 animate-[fadeSlideUp_0.4s_ease-out]">
            <div className="w-12 h-12 rounded-2xl bg-base border border-subtle flex items-center justify-center text-muted/30">
              <FolderOpen size={24} />
            </div>
            <div className="space-y-1.5">
              <span className="block text-[13px] font-semibold text-primary">Explorer is empty</span>
              <span className="block text-[11px] text-muted leading-relaxed">Open a folder to start building with Nexus AI.</span>
            </div>
            <button className="mt-2 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-accent-violet border border-accent-violet/30 rounded-xl hover:bg-accent-violet/10 transition-all btn-press shadow-sm">
              Open Workspace
            </button>
          </div>
        )}

        {activeSidebarTab === 'search' && (
          <div className="flex flex-col gap-4 animate-[fadeSlideUp_0.4s_ease-out]">
            <div className="relative group">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Global Search"
                className="w-full bg-base border border-default rounded-xl px-4 py-2.5 text-[12px] text-primary placeholder-muted outline-none focus:border-accent-violet/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.05)] transition-all"
              />
              <Search size={14} className="absolute right-4 top-3 text-muted group-focus-within:text-accent-violet transition-colors" />
            </div>
            <div className="flex flex-col items-center justify-center gap-4 text-center pt-12 opacity-40">
              <Search size={24} className="text-muted" />
              <span className="text-[11px] font-medium text-muted">
                {searchQuery ? `No matches found` : 'Search across all files'}
              </span>
            </div>
          </div>
        )}

        {activeSidebarTab === 'git' && (
          <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-6 animate-[fadeSlideUp_0.4s_ease-out]">
            <div className="w-12 h-12 rounded-2xl bg-base border border-subtle flex items-center justify-center text-muted/30">
              <GitBranch size={24} />
            </div>
            <div className="space-y-1.5">
              <span className="block text-[13px] font-semibold text-primary">No Source Control</span>
              <span className="block text-[11px] text-muted leading-relaxed">Initialize a git repository to track your changes.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

