import { useCallback } from 'react';
import { FileNode } from '../../hooks/useFileTree';

interface FileTreeNodeProps {
  node: FileNode;
  level: number;
  selectedPath: string | null;
  onToggleExpand: (path: string) => void;
  onSelect: (path: string) => void;
  onContextMenu?: (e: React.MouseEvent, node: FileNode) => void;
}

export function FileTreeNode({
  node,
  level,
  selectedPath,
  onToggleExpand,
  onSelect,
  onContextMenu,
}: FileTreeNodeProps) {
  const isExpanded = node.isExpanded;
  const isSelected = selectedPath === node.path;
  const hasChildren = node.isDir;

  const handleClick = useCallback(() => {
    if (hasChildren) {
      onToggleExpand(node.path);
    } else {
      onSelect(node.path);
    }
  }, [hasChildren, node.path, onToggleExpand, onSelect]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onContextMenu?.(e, node);
    },
    [node, onContextMenu]
  );

  const getFileIcon = (name: string, isDir: boolean) => {
    if (isDir) {
      return isExpanded ? '📂' : '📁';
    }
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const iconMap: Record<string, string> = {
      md: '📝',
      markdown: '📝',
      txt: '📄',
      json: '📋',
      js: '📜',
      jsx: '📜',
      ts: '📘',
      tsx: '📘',
      css: '🎨',
      html: '🌐',
      svg: '🖼️',
      png: '🖼️',
      jpg: '🖼️',
      gif: '🖼️',
      pdf: '📕',
      zip: '📦',
      rs: '🦀',
      go: '🐹',
      py: '🐍',
      java: '☕',
      gitignore: '🙈',
      lock: '🔒',
    };
    return iconMap[ext] || '📄';
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 px-2 py-1 cursor-pointer hover:bg-[var(--bg-hover)] ${
          isSelected ? 'bg-[var(--bg-selected)]' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        title={`${node.name}${node.isDir ? '' : ` (${formatSize(node.size)})`}`}
      >
        {/* 展开/折叠箭头 */}
        {hasChildren && (
          <span className="w-4 text-center text-xs text-[var(--text-secondary)]">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span className="w-4" />}

        {/* 图标 */}
        <span className="text-sm">
          {getFileIcon(node.name, node.isDir)}
        </span>

        {/* 文件名 */}
        <span
          className={`flex-1 text-sm truncate ${
            isSelected ? 'font-medium text-[var(--accent-color)]' : 'text-[var(--text-primary)]'
          }`}
        >
          {node.name}
        </span>

        {/* 文件大小 */}
        {!node.isDir && node.size > 0 && (
          <span className="text-xs text-[var(--text-secondary)]">
            {formatSize(node.size)}
          </span>
        )}

        {/* 加载中 */}
        {node.isLoading && (
          <span className="animate-spin text-xs">⏳</span>
        )}
      </div>

      {/* 子节点 */}
      {isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              level={level + 1}
              selectedPath={selectedPath}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
            />
          ))}
          {node.children.length === 0 && (
            <div
              className="text-xs text-[var(--text-secondary)] italic px-2 py-1"
              style={{ paddingLeft: `${(level + 1) * 16 + 8 + 20}px` }}
            >
              空文件夹
            </div>
          )}
        </div>
      )}
    </div>
  );
}

