import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../store';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import type { Notification } from '../../store/ui';

const ICON_MAP = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const COLOR_MAP: Record<string, string> = {
  info: 'var(--accent-violet)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
};

const DISMISS_MS: Record<string, number> = {
  info: 3000,
  success: 3000,
  warning: 6000,
  error: 0, // manual only
};

const ToastItem = ({ notification, onDismiss }: { notification: Notification; onDismiss: () => void }) => {
  const [exiting, setExiting] = useState(false);
  const Icon = ICON_MAP[notification.type];
  const color = COLOR_MAP[notification.type];
  const dismissMs = DISMISS_MS[notification.type];

  useEffect(() => {
    if (dismissMs <= 0) return;
    const timeout = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 120);
    }, dismissMs);
    return () => clearTimeout(timeout);
  }, [dismissMs, onDismiss]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onDismiss, 120);
  };

  return (
    <div
      style={{
        animation: exiting
          ? 'fadeSlideToRight 120ms cubic-bezier(0.4,0,1,1) forwards'
          : 'fadeSlideFromRight 180ms cubic-bezier(0.16,1,0.3,1) forwards',
        borderColor: color + '4d', // 30% opacity
      }}
      className="w-[320px] bg-elevated border rounded-[10px] shadow-2xl overflow-hidden"
    >
      <div className="flex items-start gap-3 p-3">
        <Icon size={16} style={{ color, flexShrink: 0, marginTop: 2 }} />
        <span className="text-[13px] text-primary leading-snug flex-1">{notification.message}</span>
        <button
          onClick={handleClose}
          className="p-0.5 text-muted hover:text-primary transition-colors flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
      {dismissMs > 0 && (
        <div
          style={{
            backgroundColor: color,
            animationDuration: `${dismissMs}ms`,
          }}
          className="h-[2px] animate-[toastProgress_linear_forwards]"
        />
      )}
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  // Only show last 3
  const visible = notifications.slice(-3);

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-10 right-4 z-[300] flex flex-col gap-2">
      {visible.map((n) => (
        <ToastItem key={n.id} notification={n} onDismiss={() => removeNotification(n.id)} />
      ))}
    </div>
  );
};
