import React, { useEffect, useState } from 'react';
import { useAIStore } from '../../store';
import { Activity } from 'lucide-react';

export const PulsePanel: React.FC = () => {
  const { isStreaming, streamMetrics } = useAIStore();
  const [elapsed, setElapsed] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isStreaming && streamMetrics) {
      setVisible(true);
      interval = setInterval(() => {
        setElapsed((Date.now() - streamMetrics.startTime) / 1000);
      }, 100);
    } else {
      // Fade out after a delay when streaming stops
      const timeout = setTimeout(() => {
        setVisible(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }

    return () => clearInterval(interval);
  }, [isStreaming, streamMetrics]);

  if (!visible) return null;

  const tps = streamMetrics && elapsed > 0 ? (streamMetrics.tokens / elapsed).toFixed(1) : '0.0';

  return (
    <div 
      className={`absolute bottom-4 right-4 z-[100] flex items-center gap-3 bg-elevated border border-default rounded-[8px] px-3 py-2 shadow-xl transition-opacity duration-300 ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
    >
      <Activity size={14} className={isStreaming ? 'text-accent-cyan animate-pulse' : 'text-muted'} />
      <div className="flex items-center gap-4 font-mono text-[10px]">
        <div className="flex flex-col">
          <span className="text-muted">TOKENS</span>
          <span className="text-primary">{streamMetrics?.tokens || 0}</span>
        </div>
        <div className="w-[1px] h-6 bg-default" />
        <div className="flex flex-col">
          <span className="text-muted">SPEED</span>
          <span className="text-accent-cyan">{tps} t/s</span>
        </div>
        <div className="w-[1px] h-6 bg-default" />
        <div className="flex flex-col">
          <span className="text-muted">TIME</span>
          <span className="text-primary">{elapsed.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
};
