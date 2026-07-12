interface StatusBarProps {
  charCount: number;
  wordCount: number;
  lineCount: number;
  currentLine: number;
  currentCol: number;
  fileName: string;
  isModified: boolean;
  fileType?: string;
  fileSize?: string;
  encoding?: string;
  lineEnding?: string;
}

export function StatusBar({
  charCount,
  wordCount,
  lineCount,
  currentLine,
  currentCol,
  fileName,
  isModified,
  fileType = 'Markdown',
  fileSize,
  encoding = 'UTF-8',
  lineEnding = 'LF',
}: StatusBarProps) {
  return (
    <div
      className="flex items-center justify-between px-3 py-1 text-xs border-t select-none"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-secondary)',
      }}
      role="status"
      aria-label="Editor status"
    >
      <div className="flex items-center gap-4">
        <span title="文件名" className="flex items-center gap-1">
          📄 {fileName || '未命名'}
          {isModified && <span className="text-orange-500">●</span>}
        </span>
        <span title="文件类型">{fileType}</span>
        {fileSize && <span title="文件大小">{fileSize}</span>}
      </div>

      <div className="flex items-center gap-4">
        <span title="光标位置">
          行 {currentLine}, 列 {currentCol}
        </span>
        <span title="行数">{lineCount} 行</span>
        <span title="字数">{wordCount} 词</span>
        <span title="字符数">{charCount} 字符</span>
        <span title="编码">{encoding}</span>
        <span title="换行符">{lineEnding}</span>
      </div>
    </div>
  );
}
