import { useState, useCallback } from 'react';

export interface Tab {
  id: string;
  filePath: string | null;
  fileName: string;
  isModified: boolean;
  content: string;
  icon: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  onTabRename?: (tabId: string, newName: string) => void;
}

export function TabBar({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onNewTab,
  onTabRename,
}: TabBarProps) {
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const getTabIcon = (tab: Tab): string => {
    if (tab.icon) return tab.icon;
    if (!tab.filePath) return '📄';
    const ext = tab.filePath.split('.').pop()?.toLowerCase() || '';
    const iconMap: Record<string, string> = {
      md: '📝',
      markdown: '📝',
      txt: '📄',
      json: '📋',
      js: '📜',
      ts: '📘',
      css: '🎨',
      html: '🌐',
      rs: '🦀',
    };
    return iconMap[ext] || '📄';
  };

  const handleTabClose = useCallback(
    (e: React.MouseEvent, tabId: string) => {
      e.stopPropagation();
      onTabClose(tabId);
    },
    [onTabClose]
  );

  const handleDoubleClick = useCallback(
    (tabId: string) => {
      if (onTabRename) {
        const tab = tabs.find((t) => t.id === tabId);
        if (tab) {
          setRenamingTabId(tabId);
          setRenameValue(tab.fileName);
        }
      }
    },
    [tabs, onTabRename]
  );

  const handleRenameConfirm = useCallback(() => {
    if (renamingTabId && renameValue.trim() && onTabRename) {
      onTabRename(renamingTabId, renameValue.trim());
    }
    setRenamingTabId(null);
    setRenameValue('');
  }, [renamingTabId, renameValue, onTabRename]);

  return (
    <div
      className="flex items-end overflow-x-auto border-b"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
        minHeight: 36,
      }}
    >
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`group flex items-center gap-1.5 px-3 py-2 cursor-pointer border-r min-w-[120px] max-w-[200px] ${
            tab.id === activeTabId
              ? 'bg-[var(--bg-primary)] border-t-2 border-t-[var(--accent-color)]'
              : 'hover:bg-[var(--bg-hover)]'
          }`}
          style={{ borderColor: 'var(--border-color)' }}
          onClick={() => onTabSelect(tab.id)}
          onDoubleClick={() => handleDoubleClick(tab.id)}
        >
          <span className="text-sm flex-shrink-0">{getTabIcon(tab)}</span>
          
          {renamingTabId === tab.id ? (
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameConfirm}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameConfirm();
                if (e.key === 'Escape') {
                  setRenamingTabId(null);
                  setRenameValue('');
                }
              }}
              className="flex-1 min-w-0 px-1 py-0.5 text-xs border rounded bg-[var(--bg-primary)]"
              style={{ borderColor: 'var(--border-color)' }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className={`flex-1 min-w-0 text-xs truncate ${
                tab.id === activeTabId
                  ? 'text-[var(--text-primary)] font-medium'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              {tab.fileName}
              {tab.isModified && (
                <span className="ml-1 text-[var(--accent-color)]">●</span>
              )}
            </span>
          )}

          <button
            onClick={(e) => handleTabClose(e, tab.id)}
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}

      {/* 新建标签按钮 */}
      <button
        onClick={onNewTab}
        className="flex-shrink-0 p-2 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
        title="新建标签 (Ctrl+T)"
      >
        +
      </button>
    </div>
  );
}
