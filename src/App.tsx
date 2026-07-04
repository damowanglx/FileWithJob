import { useState, useCallback, useRef, useEffect } from "react";
import { open, save, ask } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Editor } from "./components/Editor/Editor";
import { Preview, type PreviewRef } from "./components/Preview/Preview";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { StatusBar } from "./components/StatusBar/StatusBar";
import { useTheme } from "./hooks/useTheme";
import { readFile, writeFile } from "./hooks/useFileOperation";
import { exportToPdf, exportToImage } from "./utils/export";
import "./index.css";

// Error boundary wrapper
function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <div className="text-center p-8">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl mb-2">应用出现错误</h2>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{error.message}</p>
        <button onClick={resetError} className="px-4 py-2 rounded" style={{ backgroundColor: "var(--accent-color)", color: "white" }}>重新加载</button>
      </div>
    </div>
  );
}

const EXAMPLE_CONTENT = `# 欢迎使用 FileWithJob

这是一个 **Markdown 编辑器**，支持实时预览。

## 功能特点

- ✅ Markdown 语法高亮
- ✅ 实时预览
- ✅ 导出 PDF / 图片
- ✅ 亮色/暗色主题切换

## 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## 表格

| 功能 | 状态 |
|------|------|
| 编辑器 | ✅ 完成 |
| 预览 | ✅ 完成 |
| 导出 | ✅ 完成 |

> 💡 提示：点击工具栏按钮可以快速插入 Markdown 语法。

---

开始编辑吧！按 \`Ctrl+S\` 保存文件。
`;

function App() {
  const { theme, toggleTheme } = useTheme();
  const [content, setContent] = useState(EXAMPLE_CONTENT);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [isModified, setIsModified] = useState(false);
  const [currentLine, setCurrentLine] = useState(1);
  const [currentCol, setCurrentCol] = useState(1);
  const [editorView, setEditorView] = useState<any>(null);
  const [appError, setAppError] = useState<Error | null>(null);
  const previewRef = useRef<PreviewRef>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update window title
  useEffect(() => {
    const fileName = filePath ? filePath.split(/[/\\]/).pop() : null;
    const prefix = isModified ? "● " : "";
    const suffix = fileName ? ` - ${fileName}` : "";
    const title = `${prefix}FileWithJob${suffix} - Markdown 编辑器`;
    document.title = title;
    getCurrentWindow().setTitle(title).catch(() => {});
  }, [filePath, isModified]);

  // Auto-save timer
  useEffect(() => {
    if (isModified && filePath) {
      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          await writeFile(filePath, content);
          setIsModified(false);
        } catch (err) {
          console.error("自动保存失败:", err);
        }
      }, 30000); // Auto-save after 30s of inactivity
    }
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [isModified, filePath, content]);

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsModified(true);
  }, []);

  // Track cursor position (line + col)
  const handleCursorChange = useCallback((line: number, col: number) => {
    setCurrentLine(line);
    setCurrentCol(col);
  }, []);

  const handleEditorReady = useCallback((view: any) => {
    setEditorView(view);
  }, []);

  // Insert markdown syntax
  const handleInsertMarkdown = useCallback((before: string, after: string = "") => {
    if (!editorView) return;
    const { state } = editorView;
    const { from, to } = state.selection.main;
    const selected = state.sliceDoc(from, to);
    const replacement = before + (selected || "文本") + after;
    editorView.dispatch({
      changes: { from, to, insert: replacement },
      selection: { anchor: from + before.length, head: from + before.length + (selected || "文本").length },
    });
    editorView.focus();
  }, [editorView]);

  // Confirm unsaved changes
  const confirmDiscard = useCallback(async (): Promise<boolean> => {
    if (!isModified) return true;
    const result = await ask("当前文件未保存，是否放弃修改？", {
      title: "未保存的更改",
      kind: "warning",
    });
    return result;
  }, [isModified]);

  // New file
  const handleNewFile = useCallback(async () => {
    const canProceed = await confirmDiscard();
    if (!canProceed) return;
    setContent("");
    setFilePath(null);
    setIsModified(false);
    setCurrentLine(1);
    setCurrentCol(1);
  }, [confirmDiscard]);

  // Open file
  const handleOpenFile = useCallback(async () => {
    const canProceed = await confirmDiscard();
    if (!canProceed) return;
    try {
      const selected = await open({
        multiple: false,
        filters: [
          { name: "Markdown 文件", extensions: ["md", "markdown"] },
          { name: "文本文件", extensions: ["txt"] },
          { name: "所有文件", extensions: ["*"] },
        ],
      });

      if (selected) {
        const path = typeof selected === "string" ? selected : String(selected);
        const fileContent = await readFile(path);
        setContent(fileContent);
        setFilePath(path);
        setIsModified(false);
        setCurrentLine(1);
        setCurrentCol(1);
      }
    } catch (err) {
      console.error("打开文件失败:", err);
    }
  }, [confirmDiscard]);

  // Save file
  const handleSaveFile = useCallback(async () => {
    try {
      if (filePath) {
        await writeFile(filePath, content);
        setIsModified(false);
      } else {
        const path = await save({
          filters: [
            { name: "Markdown 文件", extensions: ["md"] },
            { name: "文本文件", extensions: ["txt"] },
          ],
        });

        if (path) {
          await writeFile(path, content);
          setFilePath(path);
          setIsModified(false);
        }
      }
    } catch (err) {
      console.error("保存文件失败:", err);
    }
  }, [filePath, content]);

  // Export as PDF
  const handleExportPdf = useCallback(async () => {
    const el = previewRef.current?.getElement();
    if (!el) return;
    const baseName = filePath
      ? filePath.split(/[/\\]/).pop()!.replace(/\.(md|markdown)$/i, "")
      : "文档";
    await exportToPdf(el, `${baseName}.pdf`);
  }, [filePath]);

  // Export as Image
  const handleExportImage = useCallback(async () => {
    const el = previewRef.current?.getElement();
    if (!el) return;
    const baseName = filePath
      ? filePath.split(/[/\\]/).pop()!.replace(/\.(md|markdown)$/i, "")
      : "文档";
    await exportToImage(el, `${baseName}.png`);
  }, [filePath]);

  // Sync scroll (improved with line-based approach)
  const handleEditorScroll = useCallback(() => {
    if (!editorScrollRef.current || !previewScrollRef.current) return;
    const editorEl = editorScrollRef.current.querySelector(".cm-scroller") as HTMLElement;
    const previewEl = previewScrollRef.current;
    if (!editorEl) return;

    const editorScrollRatio = editorEl.scrollTop / (editorEl.scrollHeight - editorEl.clientHeight || 1);
    previewEl.scrollTop = editorScrollRatio * (previewEl.scrollHeight - previewEl.clientHeight);
  }, []);

  // Stats
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content ? content.split("\n").length : 1;
  const fileName = filePath ? filePath.split(/[/\\]/).pop() || "" : "";

  // Error boundary
  if (appError) {
    return <ErrorFallback error={appError} resetError={() => { setAppError(null); window.location.reload(); }} />;
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Toolbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onNewFile={handleNewFile}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onExportPdf={handleExportPdf}
        onExportImage={handleExportImage}
        onInsertMarkdown={handleInsertMarkdown}
        hasContent={content.length > 0}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Editor pane */}
        <div className="flex-1 flex flex-col overflow-hidden border-r" style={{ borderColor: "var(--border-color)" }}>
          <div className="px-3 py-1 text-xs font-medium border-b flex items-center gap-2" style={{ backgroundColor: "var(--bg-sidebar)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
            <span>📝 编辑器</span>
            {isModified && <span className="text-orange-500">● 已修改</span>}
          </div>
          <div ref={editorScrollRef} className="flex-1 overflow-hidden" onScroll={handleEditorScroll}>
            <Editor
              content={content}
              onChange={handleContentChange}
              onCursorChange={handleCursorChange}
              onEditorReady={handleEditorReady}
              theme={theme}
            />
          </div>
        </div>

        {/* Preview pane */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3 py-1 text-xs font-medium border-b" style={{ backgroundColor: "var(--bg-sidebar)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
            👁️ 预览
          </div>
          <div ref={previewScrollRef} className="flex-1 overflow-y-auto">
            <Preview ref={previewRef} content={content} />
          </div>
        </div>
      </div>

      <StatusBar
        charCount={charCount}
        wordCount={wordCount}
        lineCount={lineCount}
        currentLine={currentLine}
        currentCol={currentCol}
        fileName={fileName}
        isModified={isModified}
      />
    </div>
  );
}

export default App;
