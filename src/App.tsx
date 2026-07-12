import { useState, useCallback, useRef, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';


import { readTextFile } from '@tauri-apps/plugin-fs';
import { Editor } from './components/Editor/Editor';
import { Preview } from './components/Preview/Preview';
import { Toolbar } from './components/Toolbar/Toolbar';
import { StatusBar } from './components/StatusBar/StatusBar';
import { Notifications } from './components/Notification/Notification';
import { ContextMenu } from './components/ContextMenu/ContextMenu';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { FileTree } from './components/FileTree/FileTree';
import { TabBar, Tab } from './components/TabBar/TabBar';
import { SearchReplace } from './components/SearchReplace/SearchReplace';
import { TableOfContents } from './components/TableOfContents/TableOfContents';

import { useTheme } from './hooks/useTheme';
import { useNotifications } from './hooks/useNotifications';
import { useFileActions } from './hooks/useFileActions';
import { usePersistedState } from './hooks/usePersistedState';
import { useKeyboardShortcuts, SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { useSettings } from './hooks/useSettings';
import { useRecentFiles } from './hooks/useRecentFiles';
import { readFile } from './hooks/useFileOperation';
import { formatFileSize } from './utils/pathUtils';
import './index.css';

// 示例内容
const EXAMPLE_CONTENT = `# 欢迎使用 FileWithJob

这是一个 **Markdown 编辑器**，支持实时预览。

## 功能特点

- ✅ Markdown 语法高亮
- ✅ 实时预览
- ✅ 导出 PDF / 图片
- ✅ 亮色/暗色主题切换
- ✅ 支持多种文件格式
- ✅ 右键菜单支持
- ✅ 拖拽调整面板宽度
- ✅ 文件树浏览
- ✅ 多标签页编辑
- ✅ 搜索替换
- ✅ 目录导航
- ✅ 数学公式支持
- ✅ Mermaid 图表支持

## 数学公式

行内公式：$E = mc^2$

块级公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

---

开始编辑吧！
`;

interface AppState {
  // 标签页
  tabs: Tab[];
  activeTabId: string | null;
  
  // UI 状态
  showFileTree: boolean;
  showToc: boolean;
  showSearch: boolean;
  showSettings: boolean;
  showWelcome: boolean;
  
  // 编辑器状态
  currentLine: number;
  currentCol: number;
  editorWidth: number;
  isDragging: boolean;
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const { notifications, removeNotification } = useNotifications();
  const { settings, updateSetting } = useSettings();
  const { addRecentFile } = useRecentFiles();
  const {
    filePath,
    isModified,
    content,
    currentFileType,
    updateContent,
    handleNewFile: baseHandleNewFile,
    handleOpenFile: baseHandleOpenFile,
    handleSaveFile,
    handleExportPdf,
    handleExportImage,
    loadContent,
  } = useFileActions();

  const [state, setState] = useState<AppState>({
    tabs: [],
    activeTabId: null,
    showFileTree: false,
    showToc: false,
    showSearch: false,
    showSettings: false,
    showWelcome: true,
    currentLine: 1,
    currentCol: 1,
    editorWidth: 50,
    isDragging: false,
  });

  const editorViewRef = useRef<any>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // 生成唯一 ID
  const generateId = useCallback(() => {
    return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // 创建新标签页
  const createTab = useCallback(
    (filePath: string | null = null, content: string = '', fileName: string = '未命名') => {
      const newTab: Tab = {
        id: generateId(),
        filePath,
        fileName,
        isModified: false,
        content,
        icon: '',
      };
      setState((prev) => ({
        ...prev,
        tabs: [...prev.tabs, newTab],
        activeTabId: newTab.id,
        showWelcome: false,
      }));
      return newTab;
    },
    [generateId]
  );

  // 切换标签页
  const handleTabSelect = useCallback(
    (tabId: string) => {
      setState((prev) => {
        const tab = prev.tabs.find((t) => t.id === tabId);
        if (tab) {
          loadContent(tab.content, tab.filePath);
          return { ...prev, activeTabId: tabId };
        }
        return prev;
      });
    },
    [loadContent]
  );

  // 关闭标签页
  const handleTabClose = useCallback(
    (tabId: string) => {
      setState((prev) => {
        const tabIndex = prev.tabs.findIndex((t) => t.id === tabId);
        if (tabIndex === -1) return prev;

        const newTabs = prev.tabs.filter((t) => t.id !== tabId);
        
        // 如果关闭的是当前活动标签
        if (prev.activeTabId === tabId) {
          if (newTabs.length === 0) {
            // 没有标签了，显示欢迎页
            return {
              ...prev,
              tabs: [],
              activeTabId: null,
              showWelcome: true,
            };
          }
          // 切换到相邻标签
          const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
          const newActiveTab = newTabs[newActiveIndex];
          loadContent(newActiveTab.content, newActiveTab.filePath);
          return {
            ...prev,
            tabs: newTabs,
            activeTabId: newActiveTab.id,
          };
        }

        return { ...prev, tabs: newTabs };
      });
    },
    [loadContent]
  );

  // 新建文件
  const handleNewFile = useCallback(async () => {
    await baseHandleNewFile();
    if (true) {
      createTab(null, '', '未命名');
    }
  }, [baseHandleNewFile, createTab]);

  // 打开文件
  const handleOpenFile = useCallback(async () => {
    await baseHandleOpenFile();
    if (filePath) {
      // 检查是否已有该文件的标签
      const existingTab = state.tabs.find((t) => t.filePath === filePath);
      if (existingTab) {
        handleTabSelect(existingTab.id);
      } else {
        const fileName = filePath.split(/[\/\\]/).pop() || '未命名';
        createTab(filePath, content, fileName);
        addRecentFile(filePath, fileName);
      }
    }
  }, [baseHandleOpenFile, filePath, content, state.tabs, handleTabSelect, createTab, addRecentFile]);

  // 从文件树选择文件
  const handleFileTreeSelect = useCallback(
    async (path: string) => {
      try {
        const fileContent = await readFile(path);
        const fileName = path.split(/[\/\\]/).pop() || '未命名';
        
        // 检查是否已有该文件的标签
        const existingTab = state.tabs.find((t) => t.filePath === path);
        if (existingTab) {
          handleTabSelect(existingTab.id);
        } else {
          createTab(path, fileContent, fileName);
        }
        
        addRecentFile(path, fileName);
        loadContent(fileContent, path);
      } catch (err) {
        console.error('Failed to open file:', err);
      }
    },
    [state.tabs, handleTabSelect, createTab, addRecentFile, loadContent]
  );

  // 切换预览
  const handleTogglePreview = useCallback(() => {
    updateSetting('showPreview', !settings.showPreview);
  }, [settings.showPreview, updateSetting]);

  // 快捷键配置
  useKeyboardShortcuts({
    [SHORTCUTS.NEW_FILE]: handleNewFile,
    [SHORTCUTS.OPEN_FILE]: handleOpenFile,
    [SHORTCUTS.SAVE_FILE]: handleSaveFile,
    [SHORTCUTS.BOLD]: () => handleInsertMarkdown('**', '**'),
    [SHORTCUTS.ITALIC]: () => handleInsertMarkdown('*', '*'),
    [SHORTCUTS.TOGGLE_PREVIEW]: handleTogglePreview,
  });

  // 使用持久化 Hook
  const { loadState } = usePersistedState({ content, filePath, isModified });

  // 加载保存的状态
  useEffect(() => {
    const savedState = loadState();
    if (savedState) {
      if (savedState.filePath) {
        const filePath = savedState.filePath!;
        readFile(filePath)
          .then((fileContent) => {
            loadContent(fileContent, filePath);
            const fileName = filePath.split(/[\/\\]/).pop() || '未命名';
            createTab(filePath, fileContent, fileName);
          })
          .catch(() => {
            loadContent(savedState.content);
            createTab(null, savedState.content, '未命名');
          });
      } else if (savedState.content) {
        loadContent(savedState.content);
        createTab(null, savedState.content, '未命名');
      }
    } else {
      loadContent(EXAMPLE_CONTENT);
      createTab(null, EXAMPLE_CONTENT, '欢迎.md');
    }
  }, []);

  // 更新窗口标题
  useEffect(() => {
    const fileName = filePath ? filePath.split(/[\/\\]/).pop() : null;
    const prefix = isModified ? '● ' : '';
    const suffix = fileName ? ` - ${fileName}` : '';
    const title = `${prefix}FileWithJob${suffix}`;
    document.title = title;
    getCurrentWindow().setTitle(title).catch(() => {});
  }, [filePath, isModified]);

  // 编辑器内容变化
  const handleContentChange = useCallback(
    (newContent: string) => {
      updateContent(newContent);
      // 更新当前标签内容
      setState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === prev.activeTabId
            ? { ...t, content: newContent, isModified: true }
            : t
        ),
      }));
    },
    [updateContent]
  );

  // 光标位置变化
  const handleCursorChange = useCallback((line: number, col: number) => {
    setState((prev) => ({ ...prev, currentLine: line, currentCol: col }));
  }, []);

  // 编辑器就绪
  const handleEditorReady = useCallback((view: any) => {
    editorViewRef.current = view;
  }, []);

  // 插入 Markdown 语法
  const handleInsertMarkdown = useCallback(
    (before: string, after: string = '') => {
      const view = editorViewRef.current;
      if (!view) return;

      const { state } = view;
      const { from, to } = state.selection.main;
      const selected = state.sliceDoc(from, to);
      const replacement = before + (selected || '文本') + after;

      view.dispatch({
        changes: { from, to, insert: replacement },
        selection: {
          anchor: from + before.length,
          head: from + before.length + (selected || '文本').length,
        },
      });
      view.focus();
    },
    []
  );

  // 打开 Markdown 说明 - 修复版本
  const handleOpenMarkdownGuide = useCallback(async () => {
    try {
      const guideContent = await readTextFile('public/MarkdownGuide.md');
      loadContent(guideContent);
      createTab(null, guideContent, 'Markdown指南.md');
    } catch (err) {
      console.error('Failed to open Markdown guide:', err);
    }
  }, [loadContent, createTab]);

  // 导出 PDF
  const handleExportPdfClick = useCallback(() => {
    const el = previewContainerRef.current;
    if (!el) {
      if (!settings.showPreview) {
        updateSetting('showPreview', true);
        setTimeout(() => {
          const retryEl = previewContainerRef.current;
          handleExportPdf(retryEl);
        }, 500);
      }
      return;
    }
    handleExportPdf(el);
  }, [handleExportPdf, settings.showPreview, updateSetting]);

  // 导出图片
  const handleExportImageClick = useCallback(() => {
    const el = previewContainerRef.current;
    if (!el) {
      if (!settings.showPreview) {
        updateSetting('showPreview', true);
        setTimeout(() => {
          const retryEl = previewContainerRef.current;
          handleExportImage(retryEl);
        }, 500);
      }
      return;
    }
    handleExportImage(el);
  }, [handleExportImage, settings.showPreview, updateSetting]);

  // 同步滚动
  const handleEditorScroll = useCallback(() => {
    if (!editorScrollRef.current || !previewScrollRef.current || !settings.showPreview) return;
    
    const editorEl = editorScrollRef.current.querySelector('.cm-scroller') as HTMLElement;
    const previewEl = previewScrollRef.current;
    if (!editorEl) return;

    const editorScrollRatio =
      editorEl.scrollTop / (editorEl.scrollHeight - editorEl.clientHeight || 1);
    previewEl.scrollTop =
      editorScrollRatio * (previewEl.scrollHeight - previewEl.clientHeight);
  }, [settings.showPreview]);

  // 拖拽调整宽度
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, isDragging: true }));
  }, []);

  useEffect(() => {
    if (!state.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      setState((prev) => ({
        ...prev,
        editorWidth: Math.max(20, Math.min(80, newWidth)),
      }));
    };

    const handleMouseUp = () => {
      setState((prev) => ({ ...prev, isDragging: false }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [state.isDragging]);

  // 跳转到行
  const handleJumpToLine = useCallback(
    (line: number) => {
      const view = editorViewRef.current;
      if (!view) return;

      const doc = view.state.doc;
      if (line < 1 || line > doc.lines) return;

      const linePos = doc.line(line).from;
      view.dispatch({
        selection: { anchor: linePos },
        scrollIntoView: true,
      });
      view.focus();
    },
    []
  );

  // 搜索
  const handleSearch = useCallback(
    (query: string, options: { caseSensitive: boolean; wholeWord: boolean; useRegex: boolean }) => {
      // TODO: 实现搜索功能
      console.log('Search:', query, options);
    },
    []
  );

  // 替换
  const handleReplace = useCallback(
    (replacement: string, replaceAll: boolean) => {
      // TODO: 实现替换功能
      console.log('Replace:', replacement, replaceAll);
    },
    []
  );

  // 右键菜单配置
  const contextMenuItems = [
    {
      label: '剪切',
      icon: '✂️',
      shortcut: 'Ctrl+X',
      action: () => document.execCommand('cut'),
    },
    {
      label: '复制',
      icon: '📋',
      shortcut: 'Ctrl+C',
      action: () => document.execCommand('copy'),
    },
    {
      label: '粘贴',
      icon: '📌',
      shortcut: 'Ctrl+V',
      action: () => document.execCommand('paste'),
    },
    { divider: true, label: '', action: () => {} },
    {
      label: '全选',
      icon: '☑️',
      shortcut: 'Ctrl+A',
      action: () => {
        const view = editorViewRef.current;
        if (view) {
          view.dispatch({
            selection: { anchor: 0, head: view.state.doc.length },
          });
        }
      },
    },
    { divider: true, label: '', action: () => {} },
    {
      label: '加粗',
      icon: '𝐁',
      shortcut: 'Ctrl+B',
      action: () => handleInsertMarkdown('**', '**'),
    },
    {
      label: '斜体',
      icon: '𝐼',
      shortcut: 'Ctrl+I',
      action: () => handleInsertMarkdown('*', '*'),
    },
    { divider: true, label: '', action: () => {} },
    {
      label: '保存文件',
      icon: '💾',
      shortcut: 'Ctrl+S',
      action: handleSaveFile,
    },
    { divider: true, label: '', action: () => {} },
    {
      label: '设置',
      icon: '⚙️',
      action: () => setState((prev) => ({ ...prev, showSettings: true })),
    },
  ];

  // 统计信息
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content ? content.split('\n').length : 1;
  const fileName = filePath ? filePath.split(/[\/\\]/).pop() || '' : '';
  const fileSize = new Blob([content]).size;

  // 是否显示预览
  const shouldShowPreview =
    settings.showPreview && (!currentFileType || currentFileType.previewMode === 'markdown');

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Toolbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onNewFile={handleNewFile}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onExportPdf={handleExportPdfClick}
        onExportImage={handleExportImageClick}
        onInsertMarkdown={handleInsertMarkdown}
        onTogglePreview={handleTogglePreview}
        onOpenMarkdownGuide={handleOpenMarkdownGuide}
        onOpenSettings={() => setState((prev) => ({ ...prev, showSettings: true }))}
        onToggleFileTree={() => setState((prev) => ({ ...prev, showFileTree: !prev.showFileTree }))}
        onToggleToc={() => setState((prev) => ({ ...prev, showToc: !prev.showToc }))}
        onToggleSearch={() => setState((prev) => ({ ...prev, showSearch: !prev.showSearch }))}
        showPreview={settings.showPreview}
        showFileTree={state.showFileTree}
        showToc={state.showToc}
        hasContent={content.length > 0}
      />

      {/* 标签栏 */}
      <TabBar
        tabs={state.tabs}
        activeTabId={state.activeTabId}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
        onNewTab={handleNewFile}
      />

      <ContextMenu items={contextMenuItems}>
        <div ref={containerRef} className="flex flex-1 overflow-hidden">
          {/* 文件树 */}
          {state.showFileTree && (
            <FileTree
              onFileSelect={handleFileTreeSelect}
              isOpen={state.showFileTree}
              onToggle={() => setState((prev) => ({ ...prev, showFileTree: !prev.showFileTree }))}
            />
          )}

          {/* 主内容区 */}
          <div className="flex flex-1 overflow-hidden">
            {/* 编辑器面板 */}
            <div
              className="flex flex-col overflow-hidden"
              style={{
                width: shouldShowPreview ? `${state.editorWidth}%` : '100%',
                borderRight: shouldShowPreview ? '1px solid var(--border-color)' : 'none',
              }}
            >
              <div
                className="px-3 py-1 text-xs font-medium border-b flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--bg-sidebar)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
              >
                <span>
                  {currentFileType?.icon || '📝'} {currentFileType?.name || '编辑器'}
                </span>
                {isModified && <span className="text-orange-500">● 已修改</span>}
              </div>
              <div
                ref={editorScrollRef}
                className="flex-1 overflow-hidden"
                onScroll={handleEditorScroll}
              >
                <Editor
                  content={content}
                  onChange={handleContentChange}
                  onCursorChange={handleCursorChange}
                  onEditorReady={handleEditorReady}
                  theme={theme}
                  language={currentFileType?.extensions[0]}
                />
              </div>
            </div>

            {/* 拖拽分割线 */}
            {shouldShowPreview && (
              <div
                className="w-1 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 transition-colors"
                style={{ backgroundColor: state.isDragging ? 'var(--accent-color)' : 'var(--border-color)' }}
                onMouseDown={handleMouseDown}
              />
            )}

            {/* 预览面板 */}
            {shouldShowPreview && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div
                  className="px-3 py-1 text-xs font-medium border-b"
                  style={{
                    backgroundColor: 'var(--bg-sidebar)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  👁️ 预览
                </div>
                <div ref={previewScrollRef} className="flex-1 overflow-y-auto">
                  <div ref={previewContainerRef}>
                    <Preview
                      content={content}
                      fileName={filePath || undefined}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 目录导航 */}
          {state.showToc && (
            <TableOfContents
              content={content}
              onJumpToLine={handleJumpToLine}
              isOpen={state.showToc}
              onToggle={() => setState((prev) => ({ ...prev, showToc: !prev.showToc }))}
            />
          )}
        </div>
      </ContextMenu>

      {/* 搜索替换 */}
      {state.showSearch && (
        <SearchReplace
          onSearch={handleSearch}
          onReplace={handleReplace}
          onClose={() => setState((prev) => ({ ...prev, showSearch: false }))}
        />
      )}

      <StatusBar
        charCount={charCount}
        wordCount={wordCount}
        lineCount={lineCount}
        currentLine={state.currentLine}
        currentCol={state.currentCol}
        fileName={fileName}
        isModified={isModified}
        fileType={currentFileType?.name}
        fileSize={formatFileSize(fileSize)}
      />

      <Notifications notifications={notifications} onClose={removeNotification} />

      {/* 设置面板 */}
      {state.showSettings && (
        <SettingsPanel
          settings={settings}
          onUpdate={updateSetting}
          onClose={() => setState((prev) => ({ ...prev, showSettings: false }))}
        />
      )}
    </div>
  );
}

export default App;







