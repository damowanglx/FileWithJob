interface FormatToolbarProps {
  onInsertMarkdown: (before: string, after?: string) => void;
}

export function FormatToolbar({ onInsertMarkdown }: FormatToolbarProps) {
  return (
    <div className="flex items-center gap-1">
      <ToolbarButton onClick={() => onInsertMarkdown('**', '**')} title="加粗 (Ctrl+B)">
        <BoldIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown('*', '*')} title="斜体 (Ctrl+I)">
        <ItalicIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown('~~', '~~')} title="删除线">
        <StrikeIcon />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => onInsertMarkdown('# ')} title="一级标题">
        <span className="text-sm font-bold">H1</span>
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown('## ')} title="二级标题">
        <span className="text-sm font-bold">H2</span>
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown('### ')} title="三级标题">
        <span className="text-sm font-bold">H3</span>
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => onInsertMarkdown('- ')} title="无序列表">
        <ListIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown('1. ')} title="有序列表">
        <OrderedListIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown('- [ ] ')} title="任务列表">
        <CheckListIcon />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => onInsertMarkdown('[', '](url)')} title="插入链接">
        <LinkIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown('![alt](', ')')} title="插入图片">
        <ImageIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown('```\n', '\n```')} title="代码块">
        <CodeIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown('> ')} title="引用">
        <QuoteIcon />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => onInsertMarkdown('| 列1 | 列2 |\n| --- | --- |\n| 内容 | 内容 |\n')}
        title="插入表格"
      >
        <TableIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown('---\n')} title="分割线">
        <HRIcon />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  onClick,
  title,
  disabled = false,
  className = "",
  children,
}: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`flex items-center justify-center gap-0.5 px-1.5 py-1 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors ${className}`}
      style={{ color: 'var(--text-primary)' }}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--border-color)' }} />;
}

function BoldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}

function StrikeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 4H9a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3h6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <path d="M15 12a3 3 0 0 1 0 6H8" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  );
}

function CheckListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 8c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2v-2h-2v-2h2V8h-2zm6 0c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2v-2h-2v-2h2V8h-2z" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

function HRIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  );
}