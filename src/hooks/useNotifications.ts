import { useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

let notificationId = 0;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (type: NotificationType, title: string, message?: string, duration = 3000) => {
      const id = `notification-${++notificationId}`;
      const notification: Notification = { id, type, title, message, duration };
      
      setNotifications((prev) => [...prev, notification]);
      
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
      
      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
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
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };
}