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
      className="flex items-center justify-between px-3 py-1 text-xs border-t"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
        color: "var(--text-secondary)",
      }}
    >
      <div className="flex items-center gap-3">
        <span>
          {fileName || "未命名"}
          {isModified && " • 已修改"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span>第 {currentLine} 行</span>
        <span>共 {lineCount} 行</span>
        <span>{charCount} 字符</span>
      </div>
    </div>
  );
}
