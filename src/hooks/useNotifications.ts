import { useState, useCallback, useRef } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

let notificationId = 0;

const MAX_HISTORY = 20;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [history, setHistory] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const historyPanelRef = useRef<boolean>(false);

  const addToHistory = useCallback((notification: Notification) => {
    setHistory((prev) => {
      const newHistory = [notification, ...prev].slice(0, MAX_HISTORY);
      return newHistory;
    });
    if (!historyPanelRef.current) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  const addNotification = useCallback(
    (type: NotificationType, title: string, message?: string, duration = 3000) => {
      const id = 'notification-' + ++notificationId;
      const notification: Notification = { 
        id, 
        type, 
        title, 
        message, 
        duration,
        timestamp: Date.now()
      };
      
      setNotifications((prev) => [...prev, notification]);
      addToHistory(notification);
      
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
      
      return id;
    },
    [addToHistory]
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const markHistoryAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const setHistoryPanelOpen = useCallback((isOpen: boolean) => {
    historyPanelRef.current = isOpen;
    if (isOpen) {
      setUnreadCount(0);
    }
  }, []);

  const success = useCallback(
    (title: string, message?: string) => addNotification('success', title, message),
    [addNotification]
  );

  const error = useCallback(
    (title: string, message?: string) => addNotification('error', title, message, 5000),
    [addNotification]
  );

  const warning = useCallback(
    (title: string, message?: string) => addNotification('warning', title, message, 4000),
    [addNotification]
  );

  const info = useCallback(
    (title: string, message?: string) => addNotification('info', title, message),
    [addNotification]
  );

  return {
    notifications,
    history,
    unreadCount,
    addNotification,
    removeNotification,
    clearHistory,
    markHistoryAsRead,
    setHistoryPanelOpen,
    success,
    error,
    warning,
    info,
  };
}