import { useState, useCallback, useRef, useEffect } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Editor } from "./components/Editor/Editor";
import { Preview, type PreviewRef } from "./components/Preview/Preview";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { StatusBar } from "./components/StatusBar/StatusBar";
import { useTheme } from "./hooks/useTheme";
import { readFile, writeFile } from "./hooks/useFileOperation";
import { exportToPdf, exportToImage } from "./utils/export";
import "./index.css";

function App() {
  const { theme, toggleTheme } = useTheme();
  const [content, setContent] = useState("");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [isModified, setIsModified] = useState(false);
  const [currentLine, setCurrentLine] = useState(1);
  const [editorView, setEditorView] = useState<any>(null);
  const previewRef = useRef<PreviewRef>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);

  // Update window title with file name and modified status
  useEffect(() => {
    const fileName = filePath ? filePath.split(/[/\\]/).pop() : null;
    const prefix = isModified ? "● " : "";
    const suffix = fileName ? ` - ${fileName}` : "";
    document.title = `${prefix}FileWithJob${suffix} - Markdown 编辑器`;

    // Also update Tauri window title
    getCurrentWindow().setTitle(`${prefix}FileWithJob${suffix} - Markdown 编辑器`).catch(() => {});
  }, [filePath, isModified]);

  // Handle content changes from editor
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsModified(true);
  }, []);

  // Track cursor line position
  const handleCursorChange = useCallback((line: number) => {
    setCurrentLine(line);
  }, []);

  // Receive editor view instance
  const handleEditorReady = useCallback((view: any) => {
    setEditorView(view);
  }, []);

  // Insert markdown syntax at cursor position
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

  // New file
  const handleNewFile = useCallback(() => {
    setContent("");
    setFilePath(null);
    setIsModified(false);
    setCurrentLine(1);
  }, []);

  // Open file
  const handleOpenFile = useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          { name: "Markdown 文件", extensions: ["md"] },
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
      }
    } catch (err) {
      console.error("打开文件失败:", err);
    }
  }, []);

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
    const filename = filePath
      ? filePath.replace(/\.md$/, ".pdf")
      : "文档.pdf";
    await exportToPdf(el, filename);
  }, [filePath]);

  // Export as Image
  const handleExportImage = useCallback(async () => {
    const el = previewRef.current?.getElement();
    if (!el) return;
    const filename = filePath
      ? filePath.replace(/\.md$/, ".png")
      : "文档.png";
    await exportToImage(el, filename);
  }, [filePath]);

  // Sync scroll between editor and preview
  const handleEditorScroll = useCallback(() => {
    if (!editorScrollRef.current || !previewScrollRef.current) return;
    const editorEl = editorScrollRef.current;
    const previewEl = previewScrollRef.current;
    const editorScrollRatio = editorEl.scrollTop / (editorEl.scrollHeight - editorEl.clientHeight || 1);
    previewEl.scrollTop = editorScrollRatio * (previewEl.scrollHeight - previewEl.clientHeight);
  }, []);

  // Stats
  const charCount = content.length;
  const lineCount = content ? content.split("\n").length : 1;
  const fileName = filePath ? filePath.split(/[/\\]/).pop() || "" : "";

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Toolbar */}
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

      {/* Main content: Editor + Preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor pane */}
        <div className="flex-1 flex flex-col overflow-hidden border-r" style={{ borderColor: "var(--border-color)" }}>
          <div className="px-3 py-1 text-xs font-medium border-b" style={{ backgroundColor: "var(--bg-sidebar)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
            📝 编辑器
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

      {/* Status bar */}
      <StatusBar
        charCount={charCount}
        lineCount={lineCount}
        currentLine={currentLine}
        fileName={fileName}
        isModified={isModified}
      />
    </div>
  );
}

export default App;
