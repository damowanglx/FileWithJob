import { useState, useCallback, useEffect, useRef } from 'react';
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

/**
 * Check if a filename matches a gitignore pattern.
 * Supports basic patterns: exact name, directory name, simple wildcards (*, **).
 */
function matchesGitignorePattern(name: string, isDir: boolean, pattern: string): boolean {
  // Normalize: remove trailing slash (it indicates directory in gitignore, but we check isDir separately)
  let p = pattern;
  const patternIsDir = p.endsWith('/');
  if (patternIsDir) {
    p = p.slice(0, -1);
  }

  // If pattern specifies a directory (has trailing /) but item is not a dir, skip
  if (patternIsDir && !isDir) {
    return false;
  }

  // Exact match
  if (p === name) return true;

  // Pattern contains wildcard
  if (p.includes('*')) {
    // Convert glob to regex
    const regexStr = '^' + p
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // escape special regex chars except * and ?
      .replace(/\*\*/g, '{{DOUBLE_STAR}}')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]')
      .replace(/\{\{DOUBLE_STAR\}\}/g, '.*')
      + '$';
    try {
      const regex = new RegExp(regexStr);
      return regex.test(name);
    } catch {
      return false;
    }
  }

  return false;
}

function shouldIgnore(name: string, isDir: boolean, patterns: string[]): boolean {
  for (const pattern of patterns) {
    // Skip negation patterns for now (they re-include)
    if (pattern.startsWith('!')) continue;
    
    if (matchesGitignorePattern(name, isDir, pattern)) {
      return true;
    }
  }
  return false;
}

export function useFileTree(options: UseFileTreeOptions = {}) {
  const { rootPath, onFileSelect } = options;
  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [rootFolderPath, setRootFolderPath] = useState<string | null>(rootPath || null);
  const [isLoading, setIsLoading] = useState(false);
  const gitignorePatternsRef = useRef<string[]>([]);

  // Load gitignore patterns
  const loadGitignore = useCallback(async (directory: string) => {
    try {
      const patterns = await invoke<string[]>('parse_gitignore', { directory });
      gitignorePatternsRef.current = patterns;
    } catch {
      gitignorePatternsRef.current = [];
    }
  }, []);

  // Load directory content with gitignore filtering
  const loadChildren = useCallback(async (parentPath: string): Promise<FileNode[]> => {
    try {
      const entries = await invoke<Array<{
        name: string;
        path: string;
        is_dir: boolean;
        size: number;
        modified: number;
      }>>('read_dir', { path: parentPath });

      return entries
        .filter(entry => !shouldIgnore(entry.name, entry.is_dir, gitignorePatternsRef.current))
        .map(entry => ({
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

  // Load root directory
  const loadRoot = useCallback(async (path: string) => {
    setIsLoading(true);
    try {
      // Load gitignore patterns first
      await loadGitignore(path);
      const children = await loadChildren(path);
      setRootFolderPath(path);
      setTree(children);
    } catch (err) {
      console.error('Failed to load root:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loadChildren, loadGitignore]);

  // Expand/collapse node
  const toggleExpand = useCallback(async (path: string) => {
    const updateNode = async (nodes: FileNode[]): Promise<FileNode[]> => {
      const result: FileNode[] = [];
      for (const node of nodes) {
        if (node.path === path) {
          if (!node.isExpanded && node.isDir && (!node.children || node.children.length === 0)) {
            // First expand, load children
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

  // Select file
  const selectFile = useCallback((path: string) => {
    setSelectedPath(path);
    onFileSelect?.(path);
  }, [onFileSelect]);

  // Refresh current directory
  const refresh = useCallback(async () => {
    if (rootFolderPath) {
      await loadRoot(rootFolderPath);
    }
  }, [rootFolderPath, loadRoot]);

  // Create new file
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

  // Create new folder
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

  // Delete file/folder
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

  // Rename
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

  // Get common directories
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

  // Initialize
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
