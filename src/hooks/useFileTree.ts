import { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  modified: number;
  children?: FileNode[];
  isExpanded?: boolean;
  isLoading?: boolean;
}

interface UseFileTreeOptions {
  rootPath?: string;
  onFileSelect?: (path: string) => void;
}

export function useFileTree(options: UseFileTreeOptions = {}) {
  const { rootPath, onFileSelect } = options;
  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [rootFolderPath, setRootFolderPath] = useState<string | null>(rootPath || null);
  const [isLoading, setIsLoading] = useState(false);

  // 加载目录内容
  const loadChildren = useCallback(async (parentPath: string): Promise<FileNode[]> => {
    try {
      const entries = await invoke<Array<{
        name: string;
        path: string;
        is_dir: boolean;
        size: number;
        modified: number;
      }>>('read_dir', { path: parentPath });

      return entries.map(entry => ({
        name: entry.name,
        path: entry.path,
        isDir: entry.is_dir,
        size: entry.size,
        modified: entry.modified,
        children: entry.is_dir ? [] : undefined,
        isExpanded: false,
        isLoading: false,
      }));
    } catch (err) {
      console.error('Failed to load directory:', err);
      return [];
    }
  }, []);

  // 加载根目录
  const loadRoot = useCallback(async (path: string) => {
    setIsLoading(true);
    try {
      const children = await loadChildren(path);
      setRootFolderPath(path);
      setTree(children);
    } catch (err) {
      console.error('Failed to load root:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loadChildren]);

  // 展开/折叠节点
  const toggleExpand = useCallback(async (path: string) => {
    const updateNode = async (nodes: FileNode[]): Promise<FileNode[]> => {
      const result: FileNode[] = [];
      for (const node of nodes) {
        if (node.path === path) {
          if (!node.isExpanded && node.isDir && (!node.children || node.children.length === 0)) {
            // 首次展开，加载子节点
            const children = await loadChildren(path);
            result.push({
              ...node,
              isExpanded: true,
              children,
              isLoading: false,
            });
          } else {
            result.push({
              ...node,
              isExpanded: !node.isExpanded,
            });
          }
        } else if (node.children) {
          result.push({
            ...node,
            children: await updateNode(node.children),
          });
        } else {
          result.push(node);
        }
      }
      return result;
    };

    setTree(await updateNode(tree));
  }, [tree, loadChildren]);

  // 选择文件
  const selectFile = useCallback((path: string) => {
    setSelectedPath(path);
    onFileSelect?.(path);
  }, [onFileSelect]);

  // 刷新当前目录
  const refresh = useCallback(async () => {
    if (rootFolderPath) {
      await loadRoot(rootFolderPath);
    }
  }, [rootFolderPath, loadRoot]);

  // 创建新文件
  const createNewFile = useCallback(async (parentPath: string, name: string) => {
    try {
      const separator = parentPath.includes('\\') ? '\\' : '/';
      const filePath = `${parentPath}${separator}${name}`;
      await invoke('create_file', { path: filePath });
      await refresh();
      return filePath;
    } catch (err) {
      console.error('Failed to create file:', err);
      throw err;
    }
  }, [refresh]);

  // 创建新文件夹
  const createNewFolder = useCallback(async (parentPath: string, name: string) => {
    try {
      const separator = parentPath.includes('\\') ? '\\' : '/';
      const folderPath = `${parentPath}${separator}${name}`;
      await invoke('create_dir', { path: folderPath });
      await refresh();
      return folderPath;
    } catch (err) {
      console.error('Failed to create folder:', err);
      throw err;
    }
  }, [refresh]);

  // 删除文件/文件夹
  const deleteItem = useCallback(async (path: string) => {
    try {
      await invoke('delete_path', { path });
      if (selectedPath === path) {
        setSelectedPath(null);
      }
      await refresh();
    } catch (err) {
      console.error('Failed to delete:', err);
      throw err;
    }
  }, [selectedPath, refresh]);

  // 重命名
  const renameItem = useCallback(async (fromPath: string, toPath: string) => {
    try {
      await invoke('rename_path', { from: fromPath, to: toPath });
      if (selectedPath === fromPath) {
        setSelectedPath(toPath);
      }
      await refresh();
    } catch (err) {
      console.error('Failed to rename:', err);
      throw err;
    }
  }, [selectedPath, refresh]);

  // 获取常用目录
  const getCommonDirs = useCallback(async () => {
    try {
      return await invoke<{
        home: string | null;
        documents: string | null;
        desktop: string | null;
        downloads: string | null;
      }>('get_common_dirs');
    } catch (err) {
      console.error('Failed to get common dirs:', err);
      return null;
    }
  }, []);

  // 初始化
  useEffect(() => {
    if (rootPath) {
      loadRoot(rootPath);
    }
  }, [rootPath, loadRoot]);

  return {
    tree,
    selectedPath,
    rootFolderPath,
    isLoading,
    loadRoot,
    toggleExpand,
    selectFile,
    refresh,
    createNewFile,
    createNewFolder,
    deleteItem,
    renameItem,
    getCommonDirs,
  };
}
