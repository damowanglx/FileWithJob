import { useState, useCallback, useEffect } from 'react';

export interface RecentFile {
  path: string;
  name: string;
  lastOpened: number;
  isPinned?: boolean;
}

interface UseRecentFilesOptions {
  maxItems?: number;
  storageKey?: string;
}

export function useRecentFiles(options: UseRecentFilesOptions = {}) {
  const { maxItems = 20, storageKey = 'filewithjob_recent_files' } = options;
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  // 从 localStorage 加载
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setRecentFiles(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, [storageKey]);

  // 保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(recentFiles));
    } catch {
      // Ignore
    }
  }, [recentFiles, storageKey]);

  // 添加最近文件
  const addRecentFile = useCallback(
    (path: string, name: string) => {
      setRecentFiles((prev) => {
        const existing = prev.find((f) => f.path === path);
        const newFile: RecentFile = {
          path,
          name,
          lastOpened: Date.now(),
          isPinned: existing?.isPinned || false,
        };

        const filtered = prev.filter((f) => f.path !== path);
        return [newFile, ...filtered].slice(0, maxItems);
      });
    },
    [maxItems]
  );

  // 移除最近文件
  const removeRecentFile = useCallback((path: string) => {
    setRecentFiles((prev) => prev.filter((f) => f.path !== path));
  }, []);

  // 切换置顶
  const togglePin = useCallback((path: string) => {
    setRecentFiles((prev) =>
      prev.map((f) =>
        f.path === path ? { ...f, isPinned: !f.isPinned } : f
      )
    );
  }, []);

  // 清除所有
  const clearRecentFiles = useCallback(() => {
    setRecentFiles([]);
  }, []);

  // 排序后的文件列表（置顶优先）
  const sortedFiles = [...recentFiles].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.lastOpened - a.lastOpened;
  });

  return {
    recentFiles: sortedFiles,
    addRecentFile,
    removeRecentFile,
    togglePin,
    clearRecentFiles,
  };
}
