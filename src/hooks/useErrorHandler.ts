import { useCallback } from 'react';
import { useNotifications } from './useNotifications';

/**
 * 统一的错误处理 Hook
 */
export function useErrorHandler() {
  const { error: showError } = useNotifications();

  const handleAsyncError = useCallback(
    async <T>(
      operation: () => Promise<T>,
      errorMessage: string,
      options?: {
        showToast?: boolean;
        logToConsole?: boolean;
        fallback?: T;
      }
    ): Promise<T | undefined> => {
      const { showToast = true, logToConsole = true, fallback } = options || {};
      
      try {
        return await operation();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        if (logToConsole) {
          console.error(`[${errorMessage}]`, error);
        }
        
        if (showToast) {
          showError(errorMessage, error.message);
        }
        
        return fallback;
      }
    },
    [showError]
  );

  const handleSyncError = useCallback(
    <T>(
      operation: () => T,
      errorMessage: string,
      fallback: T
    ): T => {
      try {
        return operation();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error(`[${errorMessage}]`, error);
        return fallback;
      }
    },
    []
  );

  return { handleAsyncError, handleSyncError };
}
