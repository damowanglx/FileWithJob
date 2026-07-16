import { useState, useRef, useEffect, useCallback } from 'react';
import type { Notification, NotificationType } from '../../hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
}

function getNotificationStyles(type: NotificationType) {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        icon: '✅',
        text: 'text-green-800 dark:text-green-200',
        progress: 'bg-green-500',
      };
    case 'error':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        icon: '❌',
        text: 'text-red-800 dark:text-red-200',
        progress: 'bg-red-500',
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: '⚠️',
        text: 'text-yellow-800 dark:text-yellow-200',
        progress: 'bg-yellow-500',
      };
    case 'info':
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'ℹ️',
        text: 'text-blue-800 dark:text-blue-200',
        progress: 'bg-blue-500',
      };
  }
}

function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const styles = getNotificationStyles(notification.type);
  const [progress, setProgress] = useState(100);
  const [copied, setCopied] = useState(false);
  const duration = notification.duration || 3000;
  const startTime = useRef(Date.now());
  const animFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const animate = () => {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining > 0) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [duration]);

  const handleClick = useCallback(async () => {
    const textToCopy = notification.message 
      ? `${notification.title}\n${notification.message}` 
      : notification.title;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [notification]);

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg animate-slide-in cursor-pointer hover:shadow-xl transition-shadow relative overflow-hidden`}
      role="alert"
      onClick={handleClick}
      title="点击复制内容"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="text-lg">{styles.icon}</span>
        <div className="flex-1">
          <h4 className={`font-medium ${styles.text}`}>{notification.title}</h4>
          {notification.message && (
            <p className={`text-sm mt-1 ${styles.text} opacity-80`}>
              {notification.message}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {copied && (
            <span className="text-xs text-green-600 dark:text-green-400 animate-fade-in">
              已复制
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(notification.id);
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-black/10 dark:bg-white/10">
        <div 
          className={`h-full ${styles.progress} transition-none`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

interface NotificationsProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

export function Notifications({ notifications, onClose }: NotificationsProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          <NotificationItem
            notification={notification}
            onClose={onClose}
          />
        </div>
      ))}
    </div>
  );
}