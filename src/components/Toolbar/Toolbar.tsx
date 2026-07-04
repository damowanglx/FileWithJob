import type { Theme } from "../../hooks/useTheme";

interface ToolbarProps {
  theme: Theme;
  onToggleTheme: () => void;
  onNewFile: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onExportPdf: () => void;
  onExportImage: () => void;
  onInsertMarkdown: (before: string, after?: string) => void;
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
  onInsertMarkdown,
  hasContent,
}: ToolbarProps) {
  return (
    <div
      className="flex items-center gap-1 px-3 py-2 border-b flex-wrap"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* File operations */}
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

      <ToolbarDivider />

      {/* Markdown formatting */}
      <ToolbarButton onClick={() => onInsertMarkdown("**", "**")} title="加粗 (Ctrl+B)">
        <BoldIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown("*", "*")} title="斜体 (Ctrl+I)">
        <ItalicIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown("~~", "~~")} title="删除线">
        <StrikeIcon />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => onInsertMarkdown("# ")} title="一级标题">
        <span className="text-sm font-bold">H1</span>
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown("## ")} title="二级标题">
        <span className="text-sm font-bold">H2</span>
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown("### ")} title="三级标题">
        <span className="text-sm font-bold">H3</span>
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => onInsertMarkdown("- ")} title="无序列表">
        <ListIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown("1. ")} title="有序列表">
        <OrderedListIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown("- [ ] ")} title="任务列表">
        <CheckListIcon />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => onInsertMarkdown("[", "](url)")} title="插入链接">
        <LinkIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown("![alt](", ")")} title="插入图片">
        <ImageIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown("```\n", "\n```")} title="代码块">
        <CodeIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown("> ")} title="引用">
        <QuoteIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown("| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n")} title="插入表格">
        <TableIcon />
      </ToolbarButton>

      <ToolbarButton onClick={() => onInsertMarkdown("---\n")} title="分割线">
        <HRIcon />
      </ToolbarButton>

      <div className="flex-1" />

      {/* Export */}
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

      <ToolbarDivider />

      {/* Theme toggle */}
      <ToolbarButton onClick={onToggleTheme} title="切换主题">
        {theme === "light" ? <MoonIcon /> : <SunIcon />}
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
      className="flex items-center justify-center gap-0.5 px-1.5 py-1 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors min-w-[28px] min-h-[28px]"
      style={{ color: "var(--text-primary)" }}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 mx-1" style={{ backgroundColor: "var(--border-color)" }} />;
}

// SVG Icons
function FileIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>;
}

function FolderIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
}

function SaveIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>;
}

function BoldIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg>;
}

function ItalicIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>;
}

function StrikeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4H9a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3h6" /><line x1="4" y1="12" x2="20" y2="12" /><path d="M15 12a3 3 0 0 1 0 6H8" /></svg>;
}

function ListIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
}

function OrderedListIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>;
}

function CheckListIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
}

function LinkIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
}

function ImageIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
}

function CodeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
}

function QuoteIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 8c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2v-2h-2v-2h2V8h-2zm6 0c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2v-2h-2v-2h2V8h-2z" /></svg>;
}

function TableIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>;
}

function HRIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="2" y1="12" x2="22" y2="12" /></svg>;
}

function PdfIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
}

function ExportImageIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
}

function SunIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>;
}

function MoonIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
}
