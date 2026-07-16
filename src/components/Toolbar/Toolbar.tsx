import type { Theme } from '../../hooks/useTheme';
import { FileToolbar } from '../FileToolbar/FileToolbar';
import { FormatToolbar } from '../FormatToolbar/FormatToolbar';
import { ExportToolbar } from '../ExportToolbar/ExportToolbar';
import { ViewToolbar } from '../ViewToolbar/ViewToolbar';

interface ToolbarProps {
  theme: Theme;
  onToggleTheme: () => void;
  onNewFile: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onExportPdf: () => void;
  onExportImage: (scale: number) => void;
  onInsertMarkdown: (before: string, after?: string) => void;
  onTogglePreview: () => void;
  onOpenMarkdownGuide: () => void;
  onOpenSettings?: () => void;
  onToggleFileTree?: () => void;
  onToggleToc?: () => void;
  onToggleSearch?: () => void;
  showPreview: boolean;
  showFileTree?: boolean;
  showToc?: boolean;
  hasContent: boolean;
  isFullscreenPreview?: boolean;
  onToggleFullscreenPreview?: () => void;
}

export function Toolbar({
  theme,
  onToggleTheme,
  onNewFile,
  onOpenFile,
  onSaveFile,
  onExportPdf,
  onExportImage,
  onInsertMarkdown,
  onTogglePreview,
  onOpenMarkdownGuide,
  onOpenSettings,
  onToggleFileTree,
  onToggleToc,
  onToggleSearch,
  showPreview,
  showFileTree,
  showToc,
  hasContent,
  isFullscreenPreview,
  onToggleFullscreenPreview,
}: ToolbarProps) {
  return (
    <div
      className="flex items-center gap-1 px-3 py-2 border-b flex-wrap"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
      }}
      role="toolbar"
      aria-label="Editor toolbar"
    >
      <FileToolbar
        onNewFile={onNewFile}
        onOpenFile={onOpenFile}
        onSaveFile={onSaveFile}
        hasContent={hasContent}
      />

      <ToolbarDivider />

      <FormatToolbar onInsertMarkdown={onInsertMarkdown} />

      <div className="flex-1" />

      {/* 视图控制按钮 */}
      {onToggleFileTree && (
        <ToolbarButton
          onClick={onToggleFileTree}
          title="文件树"
          active={showFileTree}
        >
          ??
        </ToolbarButton>
      )}

      {onToggleToc && (
        <ToolbarButton
          onClick={onToggleToc}
          title="目录"
          active={showToc}
        >
          ??
        </ToolbarButton>
      )}

      {onToggleSearch && (
        <ToolbarButton
          onClick={onToggleSearch}
          title="搜索替换 (Ctrl+H)"
        >
          ??
        </ToolbarButton>
      )}

      <ToolbarDivider />

      <ViewToolbar
        showPreview={showPreview}
        onTogglePreview={onTogglePreview}
        onOpenMarkdownGuide={onOpenMarkdownGuide}
        onOpenSettings={onOpenSettings}
      />

      {/* Fullscreen Preview Button */}
      {onToggleFullscreenPreview && (
        <ToolbarButton
          onClick={onToggleFullscreenPreview}
          title="全屏预览 (Ctrl+Shift+F)"
          active={isFullscreenPreview}
        >
          <FullscreenIcon />
          <span className="text-xs">全屏</span>
        </ToolbarButton>
      )}

      <ExportToolbar
        onExportPdf={onExportPdf}
        onExportImage={onExportImage}
        hasContent={hasContent}
      />

      <ToolbarDivider />

      <button
        onClick={onToggleTheme}
        title="切换主题"
        className="flex items-center justify-center gap-0.5 px-1.5 py-1 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors"
        style={{ color: 'var(--text-primary)' }}
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>
    </div>
  );
}

function ToolbarButton({
  onClick,
  title,
  active = false,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center px-1.5 py-1 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors ${
        active ? 'bg-black/10 dark:bg-white/10' : ''
      }`}
      style={{ color: active ? 'var(--accent-color)' : 'var(--text-primary)' }}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--border-color)' }} />;
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x2="5.64" y1="19.78" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}