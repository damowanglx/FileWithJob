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

/**
 * 格式化最后打开时间
 */
export function formatLastOpened(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');

  if (year === new Date().getFullYear()) {
    return `${month}-${day} ${hour}:${min}`;
  }
  return `${year}-${month}-${day} ${hour}:${min}`;
}

export function useRecentFiles(options: UseRecentFilesOptions = {}) {
  const { maxItems = 50, storageKey = 'filewithjob_recent_files' } = options;
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  // 从 localStorage 加载
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as RecentFile[];
        // 兼容旧数据：确保每个文件都有 lastOpened
        const migrated = parsed.map((f) => ({
          ...f,
          lastOpened: f.lastOpened || Date.now(),
        }));
        setRecentFiles(migrated);
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

  // 清除所有记录
  const clearRecentFiles = useCallback(() => {
    setRecentFiles([]);
  }, []);

  // 排序后的文件列表（置顶优先，然后按时间降序）
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
    formatLastOpened,
  };
}