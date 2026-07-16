import { useState, useCallback, useRef, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { useFileTree, FileNode } from '../../hooks/useFileTree';
import { FileTreeNode } from './FileTreeNode';
import { FileInfoDialog } from '../FileInfo/FileInfoDialog';

interface FileTreeProps {
  onFileSelect: (path: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onRootPathChange?: (path: string | null) => void;
  initialRootPath?: string | null;
}

export function FileTree({ onFileSelect, isOpen, onToggle, onRootPathChange, initialRootPath }: FileTreeProps) {
  const {
    tree,
    selectedPath,
    rootFolderPath,
    isLoading,
    loadRoot,
    toggleExpand,
    selectFile,
    refresh,
    deleteItem,
    renameItem,
  } = useFileTree({ onFileSelect, rootPath: initialRootPath || undefined });

  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  void isCreating; // Used in JSX below
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: FileNode | null;
  } | null>(null);

  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 文件属性对话框状态
  const [fileInfoPath, setFileInfoPath] = useState<string | null>(null);

  // Notify parent when rootFolderPath changes
  useEffect(() => {
    onRootPathChange?.(rootFolderPath);
  }, [rootFolderPath, onRootPathChange]);

  const handleOpenFolder = useCallback(async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: '选择文件夹',
      });
      if (selected) {
        await loadRoot(selected as string);
      }
    } catch (err) {
      console.error('Failed to open folder:', err);
    }
  }, [loadRoot]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, node: FileNode) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, node });
    },
    []
  );

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!contextMenu?.node) return;
    const confirmed = window.confirm(`确定要删除 "${contextMenu.node.name}" 吗？`);
    if (!confirmed) return;
    try {
      await deleteItem(contextMenu.node.path);
      handleCloseContextMenu();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }, [contextMenu, deleteItem, handleCloseContextMenu]);

  const handleRename = useCallback(() => {
    if (!contextMenu?.node) return;
    setRenamingPath(contextMenu.node.path);
    setRenameValue(contextMenu.node.name);
    handleCloseContextMenu();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [contextMenu, handleCloseContextMenu]);

  const handleConfirmRename = useCallback(async () => {
    if (!renamingPath || !renameValue.trim()) return;
    try {
      const separator = renamingPath.includes('\\') ? '\\' : '/';
      const parentPath = renamingPath.substring(0, renamingPath.lastIndexOf(separator));
      const newPath = `${parentPath}${separator}${renameValue.trim()}`;
      await renameItem(renamingPath, newPath);
      setRenamingPath(null);
      setRenameValue('');
    } catch (err) {
      console.error('Failed to rename:', err);
    }
  }, [renamingPath, renameValue, renameItem]);

  // 打开文件属性对话框
  const handleShowFileInfo = useCallback(() => {
    if (!contextMenu?.node) return;
    setFileInfoPath(contextMenu.node.path);
    handleCloseContextMenu();
  }, [contextMenu, handleCloseContextMenu]);

  if (!isOpen) return null;

  return (
    <div
      className="flex flex-col h-full border-r"
      style={{
        width: 260,
        minWidth: 200,
        maxWidth: 400,
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <span className="text-sm font-medium text-[var(--text-primary)]">
          ?? 文件浏览器
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleOpenFolder}
            className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
            title="打开文件夹"
          >
            ??
          </button>
          <button
            onClick={refresh}
            className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
            title="刷新"
          >
            ??
          </button>
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
            title="关闭"
          >
            ?
          </button>
        </div>
      </div>

      {rootFolderPath && (
        <div
          className="px-3 py-1.5 text-xs text-[var(--text-secondary)] border-b truncate"
          style={{ borderColor: 'var(--border-color)' }}
          title={rootFolderPath}
        >
          {rootFolderPath}
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        onClick={handleCloseContextMenu}
      >
        {isLoading && (
          <div className="flex items-center justify-center py-8 text-[var(--text-secondary)]">
            <span className="animate-spin mr-2">?</span>
            加载中...
          </div>
        )}

        {!isLoading && tree.length === 0 && !rootFolderPath && (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <span className="text-4xl mb-3">??</span>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              还没有打开文件夹
            </p>
            <button
              onClick={handleOpenFolder}
              className="px-4 py-2 text-sm rounded-lg bg-[var(--accent-color)] text-white hover:opacity-90"
            >
              打开文件夹
            </button>
          </div>
        )}

        {!isLoading && tree.length === 0 && rootFolderPath && (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <span className="text-4xl mb-3">??</span>
            <p className="text-sm text-[var(--text-secondary)]">
              文件夹为空
            </p>
          </div>
        )}

        {tree.map((node) => (
          <FileTreeNode
            key={node.path}
            node={node}
            level={0}
            selectedPath={selectedPath}
            onToggleExpand={toggleExpand}
            onSelect={selectFile}
            onContextMenu={handleContextMenu}
          />
        ))}
      </div>

      {renamingPath && (
        <div
          className="px-3 py-2 border-t"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">??</span>
            <input
              ref={inputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmRename();
                if (e.key === 'Escape') {
                  setRenamingPath(null);
                  setRenameValue('');
                }
              }}
              className="flex-1 px-2 py-1 text-sm border rounded bg-[var(--bg-primary)] text-[var(--text-primary)]"
              style={{ borderColor: 'var(--border-color)' }}
              autoFocus
            />
            <button
              onClick={handleConfirmRename}
              className="px-2 py-1 text-xs rounded bg-[var(--accent-color)] text-white"
            >
              确定
            </button>
          </div>
        </div>
      )}

      {contextMenu && (
        <div
          className="fixed z-50 bg-[var(--bg-primary)] border rounded-lg shadow-xl py-1 min-w-[160px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            borderColor: 'var(--border-color)',
          }}
        >
          {contextMenu.node?.isDir && (
            <>
              <button
                onClick={() => {
                  setIsCreating('file');
                  handleCloseContextMenu();
                }}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
              >
                ?? 新建文件
              </button>
              <button
                onClick={() => {
                  setIsCreating('folder');
                  handleCloseContextMenu();
                }}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
              >
                ?? 新建文件夹
              </button>
              <div className="border-t my-1" style={{ borderColor: 'var(--border-color)' }} />
            </>
          )}
          <button
            onClick={handleRename}
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
          >
            ?? 重命名
          </button>
          <button
            onClick={handleShowFileInfo}
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
          >
            ?? 文件属性
          </button>
          <div className="border-t my-1" style={{ borderColor: 'var(--border-color)' }} />
          <button
            onClick={handleDelete}
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--bg-hover)] text-red-500"
          >
            ??? 删除
          </button>
        </div>
      )}

      {/* 文件属性对话框 */}
      <FileInfoDialog
        isOpen={!!fileInfoPath}
        filePath={fileInfoPath}
        onClose={() => setFileInfoPath(null)}
      />
    </div>
  );
}