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
      };
    case 'error':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        icon: '❌',
        text: 'text-red-800 dark:text-red-200',
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: '⚠️',
        text: 'text-yellow-800 dark:text-yellow-200',
      };
    case 'info':
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'ℹ️',
        text: 'text-blue-800 dark:text-blue-200',
      };
  }
}

function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const styles = getNotificationStyles(notification.type);

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-lg p-4 shadow-lg animate-slide-in`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-lg">{styles.icon}</span>
        <div className="flex-1">
          <h4 className={`font-medium ${styles.text}`}>{notification.title}</h4>
          {notification.message && (
            <p className={`text-sm mt-1 ${styles.text} opacity-80`}>
              {notification.message}
            </p>
          )}
        </div>
        <button
          onClick={() => onClose(notification.id)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
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
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
}