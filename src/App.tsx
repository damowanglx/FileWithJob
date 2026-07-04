import { useState, useCallback, useRef } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
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
  const [currentLine] = useState(1);
  const previewRef = useRef<PreviewRef>(null);

  // Handle content changes from editor
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsModified(true);
  }, []);

  // New file
  const handleNewFile = useCallback(() => {
    setContent("");
    setFilePath(null);
    setIsModified(false);
  }, []);

  // Open file
  const handleOpenFile = useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          { name: "Markdown", extensions: ["md"] },
          { name: "Text", extensions: ["txt"] },
          { name: "All", extensions: ["*"] },
        ],
      });

      if (selected) {
        const path = typeof selected === "string" ? selected : String(selected);
        const fileContent = await readFile(path);
        setContent(fileContent);
        setFilePath(path);
        setIsModified(false);
      }
    } catch (err) {
      console.error("Failed to open file:", err);
    }
  }, []);

  // Save file
  const handleSaveFile = useCallback(async () => {
    try {
      if (filePath) {
        await writeFile(filePath, content);
        setIsModified(false);
      } else {
        // Save As
        const path = await save({
          filters: [
            { name: "Markdown", extensions: ["md"] },
            { name: "Text", extensions: ["txt"] },
          ],
        });

        if (path) {
          await writeFile(path, content);
          setFilePath(path);
          setIsModified(false);
        }
      }
    } catch (err) {
      console.error("Failed to save file:", err);
    }
  }, [filePath, content]);

  // Export as PDF
  const handleExportPdf = useCallback(async () => {
    const el = previewRef.current?.getElement();
    if (!el) return;
    const filename = filePath
      ? filePath.replace(/\.md$/, ".pdf")
      : "document.pdf";
    await exportToPdf(el, filename);
  }, [filePath]);

  // Export as Image
  const handleExportImage = useCallback(async () => {
    const el = previewRef.current?.getElement();
    if (!el) return;
    const filename = filePath
      ? filePath.replace(/\.md$/, ".png")
      : "document.png";
    await exportToImage(el, filename);
  }, [filePath]);

  // Stats
  const charCount = content.length;
  const lineCount = content ? content.split("\n").length : 0;
  const fileName = filePath ? filePath.split(/[/\\]/).pop() || "" : "";

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            handleSaveFile();
            break;
          case "o":
            e.preventDefault();
            handleOpenFile();
            break;
          case "n":
            e.preventDefault();
            handleNewFile();
            break;
        }
      }
    },
    [handleSaveFile, handleOpenFile, handleNewFile]
  );

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
      onKeyDown={handleKeyDown}
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
        hasContent={content.length > 0}
      />

      {/* Main content: Editor + Preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor pane */}
        <div
          className="flex-1 overflow-hidden border-r"
          style={{ borderColor: "var(--border-color)" }}
        >
          <Editor
            content={content}
            onChange={handleContentChange}
            theme={theme}
          />
        </div>

        {/* Preview pane */}
        <div className="flex-1 overflow-hidden">
          <Preview ref={previewRef} content={content} />
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
