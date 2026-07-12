interface FileToolbarProps {
  onNewFile: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  hasContent: boolean;
}

export function FileToolbar({
  onNewFile,
  onOpenFile,
  onSaveFile,
}: FileToolbarProps) {
  return (
    <div className="flex items-center gap-1">
      <ToolbarButton onClick={onNewFile} title="新建文件 (Ctrl+N)">
        <FileIcon />
        <span className="text-xs">新建</span>
      </ToolbarButton>

      <ToolbarButton onClick={onOpenFile} title="打开文件 (Ctrl+O)">
        <FolderIcon />
        <span className="text-xs">打开</span>
      </ToolbarButton>

      <ToolbarButton onClick={onSaveFile} title="保存文件 (Ctrl+S)">
        <SaveIcon />
        <span className="text-xs">保存</span>
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

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}