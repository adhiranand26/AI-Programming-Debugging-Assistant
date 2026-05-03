import React, { useRef, useState, useEffect } from 'react';
import { useEditorStore } from '../../store';
import { X, FileText, FileJson, FileType, FileCode, Terminal } from 'lucide-react';

export const TabBar: React.FC = () => {
  const { openFiles, activeFileId, setActiveFileId, closeFile, saveFile, discardFileChanges } = useEditorStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [dirtyConfirmId, setDirtyConfirmId] = useState<string | null>(null);

  // Auto-scroll to active tab
  useEffect(() => {
    if (activeFileId && scrollContainerRef.current) {
      const activeTab = scrollContainerRef.current.querySelector(`[data-tab-id="${activeFileId}"]`);
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeFileId, openFiles.length]);

  if (openFiles.length === 0) return null;

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return <FileCode size={14} className="text-accent-violet" />;
      case 'js':
      case 'jsx':
        return <FileCode size={14} className="text-warning" />;
      case 'json':
        return <FileJson size={14} className="text-success" />;
      case 'css':
        return <FileType size={14} className="text-accent-violet" />;
      case 'md':
        return <FileText size={14} className="text-muted" />;
      case 'sh':
        return <Terminal size={14} className="text-success" />;
      default:
        return <FileText size={14} className="text-muted" />;
    }
  };

  const handleCloseClick = (e: React.MouseEvent, fileId: string, isDirty: boolean) => {
    e.stopPropagation();
    if (isDirty) {
      setDirtyConfirmId(fileId);
    } else {
      closeFile(fileId);
    }
  };

  const handleMiddleClick = (e: React.MouseEvent, fileId: string, isDirty: boolean) => {
    if (e.button === 1) {
      e.preventDefault();
      handleCloseClick(e as any, fileId, isDirty);
    }
  };

  return (
    <div className="h-[34px] flex-shrink-0 flex items-center bg-panel border-b border-default overflow-hidden relative">
      <div 
        ref={scrollContainerRef}
        className="flex h-full w-full overflow-x-auto no-scrollbar scroll-smooth"
        onWheel={handleWheel}
      >
        {openFiles.map((file) => {
          const isActive = file.id === activeFileId;
          const isConfirming = dirtyConfirmId === file.id;

          return (
            <div
              key={file.id}
              data-tab-id={file.id}
              onClick={() => setActiveFileId(file.id)}
              onMouseDown={(e) => handleMiddleClick(e, file.id, file.isDirty)}
              className={`
                group relative flex items-center h-full px-3 py-2 min-w-fit max-w-[200px] cursor-pointer
                border-r border-default transition-colors duration-75 select-none
                ${isActive ? 'bg-base text-primary' : 'bg-panel text-muted hover:bg-overlay hover:text-secondary'}
              `}
            >
              {/* Active Top Border Indicator */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent-violet" />
              )}

              {isConfirming ? (
                <div className="flex items-center gap-2 text-[11px] font-ui px-1">
                  <span className="text-muted">Save?</span>
                  <button 
                    className="text-success hover:text-success font-medium opacity-80 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      saveFile(file.id);
                      closeFile(file.id);
                      setDirtyConfirmId(null);
                    }}
                  >
                    Yes
                  </button>
                  <button 
                    className="text-error hover:text-error font-medium opacity-80 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      discardFileChanges(file.id);
                      closeFile(file.id);
                      setDirtyConfirmId(null);
                    }}
                  >
                    No
                  </button>
                  <button 
                    className="text-muted hover:text-primary ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDirtyConfirmId(null);
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mr-6 truncate font-ui text-[13px]">
                    {getFileIcon(file.name)}
                    <span className="truncate">{file.name}</span>
                  </div>

                  <div className="absolute right-2 flex items-center justify-center w-5 h-5">
                    {file.isDirty && !isActive ? (
                      <div className="w-2 h-2 rounded-full bg-accent-violet group-hover:hidden" />
                    ) : null}
                    
                    <button
                      className={`
                        flex items-center justify-center w-5 h-5 rounded hover:bg-overlay
                        ${file.isDirty ? 'text-accent-violet' : 'text-muted hover:text-primary'}
                        ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                        transition-opacity duration-75
                      `}
                      onClick={(e) => handleCloseClick(e, file.id, file.isDirty)}
                    >
                      {file.isDirty && !isActive ? (
                        <div className="w-2 h-2 rounded-full bg-accent-violet hidden group-hover:block" />
                      ) : (
                        <X size={14} className={file.isDirty ? 'hidden group-hover:block' : ''} />
                      )}
                      {file.isDirty && isActive && <div className="w-2 h-2 rounded-full bg-accent-violet absolute right-1.5 pointer-events-none group-hover:hidden" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
