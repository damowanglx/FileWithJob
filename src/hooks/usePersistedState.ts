import { useEffect, useRef, useCallback } from 'react';

interface SaveableState {
  content: string;
  filePath: string | null;
  isModified: boolean;
}

const STORAGE_KEY = 'filewithjob_state';
const SAVE_DELAY = 1000; // 1秒防抖，替代原来的500ms

/**
 * 管理编辑器状态的持久化
 * 统一处理 localStorage 的读写，避免重复代码
 */
export function usePersistedState(state: SaveableState) {
  const stateRef = useRef(state);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // 更新 ref 以保持最新状态
  stateRef.current = state;

  // 保存状态到 localStorage（带防抖）
  const saveState = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      try {
        const data = {
          ...stateRef.current,
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // 忽略存储错误（如存储空间满）
      }
    }, SAVE_DELAY);
  }, []);

  // 立即保存（用于页面卸载等紧急情况）
  const saveStateImmediate = useCallback(() => {
    try {
      const data = {
        ...stateRef.current,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // 忽略存储错误
    }
  }, []);

  // 从 localStorage 加载状态
  const loadState = useCallback((): SaveableState | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      
      const data = JSON.parse(saved);
      
      // 验证数据结构
      if (typeof data.content !== 'string') return null;
      
      return {
        content: data.content,
        filePath: data.filePath || null,
        isModified: Boolean(data.isModified),
      };
    } catch {
      return null;
    }
  }, []);

  // 状态变化时自动保存
  useEffect(() => {
    saveState();
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [state.content, state.filePath, state.isModified, saveState]);

  // 页面隐藏时立即保存
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveStateImmediate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [saveStateImmediate]);

  // 页面卸载前立即保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveStateImmediate();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStateImmediate]);

  return { loadState, saveStateImmediate };
}
