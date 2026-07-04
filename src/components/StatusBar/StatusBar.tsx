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
          {fileName || "Untitled"}
          {isModified && " •"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span>Line {currentLine}</span>
        <span>{lineCount} lines</span>
        <span>{charCount} chars</span>
      </div>
    </div>
  );
}
