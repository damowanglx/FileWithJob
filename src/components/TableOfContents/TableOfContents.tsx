import { useState, useMemo, useCallback } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
  line: number;
}

interface TableOfContentsProps {
  content: string;
  onJumpToLine: (line: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function TableOfContents({
  content,
  onJumpToLine,
  isOpen,
  onToggle,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // 解析标题
  const headings = useMemo(() => {
    const items: TocItem[] = [];
    const lines = content.split('\n');
    let inCodeBlock = false;

    lines.forEach((line, index) => {
      // 跟踪代码块
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return;
      }
      if (inCodeBlock) return;

      // 匹配标题
      const match = line.match(/^(#{1,6})\s+(.+)/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/\*\*/g, '').replace(/`/g, '').trim();
        const id = `heading-${index}-${text.replace(/\s+/g, '-').toLowerCase()}`;
        items.push({ id, text, level, line: index + 1 });
      }
    });

    return items;
  }, [content]);

  // 滚动到标题
  const handleClick = useCallback(
    (item: TocItem) => {
      setActiveId(item.id);
      onJumpToLine(item.line);
    },
    [onJumpToLine]
  );

  if (!isOpen) return null;

  return (
    <div
      className="flex flex-col h-full border-l"
      style={{
        width: 240,
        minWidth: 180,
        maxWidth: 350,
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* 头部 */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <span className="text-sm font-medium text-[var(--text-primary)]">
          📑 目录
        </span>
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
          title="关闭目录"
        >
          ✕
        </button>
      </div>

      {/* 目录内容 */}
      <div className="flex-1 overflow-y-auto py-2">
        {headings.length === 0 && (
          <div className="px-3 py-4 text-center text-sm text-[var(--text-secondary)]">
            暂无标题
          </div>
        )}

        {headings.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--bg-hover)] transition-colors ${
              activeId === item.id
                ? 'bg-[var(--bg-selected)] text-[var(--accent-color)] font-medium'
                : 'text-[var(--text-primary)]'
            }`}
            style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
          >
            <span className="text-xs text-[var(--text-secondary)] mr-2">
              {'#'.repeat(item.level)}
            </span>
            <span className="truncate inline-block max-w-[160px]">
              {item.text}
            </span>
            <span className="text-xs text-[var(--text-secondary)] ml-2">
              L{item.line}
            </span>
          </button>
        ))}
      </div>

      {/* 统计 */}
      <div
        className="px-3 py-2 border-t text-xs text-[var(--text-secondary)]"
        style={{ borderColor: 'var(--border-color)' }}
      >
        共 {headings.length} 个标题
      </div>
    </div>
  );
}

