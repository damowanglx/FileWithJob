import type { Theme } from "../../hooks/useTheme";

interface ToolbarProps {
  theme: Theme;
  onToggleTheme: () => void;
  onNewFile: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onExportPdf: () => void;
  onExportImage: () => void;
  hasContent: boolean;
}

export function Toolbar({
  theme,
  onToggleTheme,
  onNewFile,
  onOpenFile,
  onSaveFile,
  onExportPdf,
  onExportImage,
  hasContent,
}: ToolbarProps) {
  return (
    <div
      className="flex items-center gap-1 px-3 py-2 border-b"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* File operations */}
      <ToolbarButton onClick={onNewFile} title="New File (Ctrl+N)">
        <FileIcon />
        <span className="text-xs">New</span>
      </ToolbarButton>

      <ToolbarButton onClick={onOpenFile} title="Open File (Ctrl+O)">
        <FolderIcon />
        <span className="text-xs">Open</span>
      </ToolbarButton>

      <ToolbarButton onClick={onSaveFile} title="Save File (Ctrl+S)">
        <SaveIcon />
        <span className="text-xs">Save</span>
      </ToolbarButton>

      <div className="w-px h-6 mx-1" style={{ backgroundColor: "var(--border-color)" }} />

      {/* Export */}
      <ToolbarButton
        onClick={onExportPdf}
        title="Export as PDF"
        disabled={!hasContent}
      >
        <PdfIcon />
        <span className="text-xs">PDF</span>
      </ToolbarButton>

      <ToolbarButton
        onClick={onExportImage}
        title="Export as Image"
        disabled={!hasContent}
      >
        <ImageIcon />
        <span className="text-xs">Image</span>
      </ToolbarButton>

      <div className="flex-1" />

      {/* Theme toggle */}
      <ToolbarButton onClick={onToggleTheme} title="Toggle Theme">
        {theme === "light" ? <MoonIcon /> : <SunIcon />}
        <span className="text-xs">{theme === "light" ? "Dark" : "Light"}</span>
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  onClick,
  title,
  disabled = false,
  children,
}: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="flex flex-col items-center gap-0.5 px-2 py-1 rounded hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-opacity"
      style={{ color: "var(--text-primary)" }}
    >
      {children}
    </button>
  );
}

// Simple SVG icons
function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
