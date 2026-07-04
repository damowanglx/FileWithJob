interface StatusBarProps {
  charCount: number;
  lineCount: number;
  currentLine: number;
  fileName: string;
  isModified: boolean;
}

export function StatusBar({
  charCount,
  lineCount,
  currentLine,
  fileName,
  isModified,
}: StatusBarProps) {
  return (
    <div
      className="flex items-center justify-between px-3 py-1 text-xs border-t select-none"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
        color: "var(--text-secondary)",
      }}
    >
      <div className="flex items-center gap-3">
        <span>
          {fileName || "未命名"}
          {isModified && " · 已修改"}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>行 {currentLine}</span>
        <span>{lineCount} 行</span>
        <span>{charCount} 字符</span>
        <span>UTF-8</span>
        <span>Markdown</span>
      </div>
    </div>
  );
}
