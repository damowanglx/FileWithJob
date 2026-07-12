interface ExportToolbarProps {
  onExportPdf: () => void;
  onExportImage: () => void;
  hasContent: boolean;
}

export function ExportToolbar({
  onExportPdf,
  onExportImage,
  hasContent,
}: ExportToolbarProps) {
  return (
    <div className="flex items-center gap-1">
      <ToolbarButton
        onClick={onExportPdf}
        title="导出为 PDF"
        disabled={!hasContent}
      >
        <PdfIcon />
        <span className="text-xs">PDF</span>
      </ToolbarButton>

      <ToolbarButton
        onClick={onExportImage}
        title="导出为图片"
        disabled={!hasContent}
      >
        <ExportImageIcon />
        <span className="text-xs">图片</span>
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

function PdfIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function ExportImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}