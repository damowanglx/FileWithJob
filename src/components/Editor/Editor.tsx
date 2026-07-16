import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState, Compartment } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { indentMore, indentLess } from '@codemirror/commands';
import { autocompletion } from '@codemirror/autocomplete';
import { search, SearchQuery, setSearchQuery, getSearchQuery, findNext, findPrevious, replaceNext, replaceAll as searchReplaceAll, highlightSelectionMatches } from '@codemirror/search';
import { foldKeymap } from '@codemirror/language';
import type { Extension } from '@codemirror/state';
import type { Theme } from '../../hooks/useTheme';

export interface EditorSearchHandle {
  search: (query: string, options: { caseSensitive: boolean; wholeWord: boolean; useRegex: boolean }) => void;
  replace: (replacementText: string, replaceAllFlag: boolean) => void;
  findNext: () => void;
  findPrevious: () => void;
}

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onCursorChange?: (line: number, col: number, lineContent?: string) => void;
  onEditorReady?: (view: EditorView) => void;
  onSearchReady?: (handle: EditorSearchHandle) => void;
  theme: Theme;
  language?: string;
  fontSize?: number;
}

const DEFAULT_FONT_SIZE = 14;

const themeCompartment = new Compartment();
const languageCompartment = new Compartment();
const fontSizeCompartment = new Compartment();

// Editor base theme (font size is handled by fontSizeCompartment for dynamic updates)
const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
  },
  '.cm-content': {
    padding: '8px 0',
    fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace",
  },
  '.cm-line': {
    padding: '0 12px',
  },
  '.cm-gutters': {
    minWidth: '40px',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  // Fold gutter arrow styles
  '.cm-foldGutter .cm-gutterElement': {
    cursor: 'pointer',
    color: 'rgba(128, 128, 128, 0.6)',
    fontSize: '12px',
    lineHeight: '1.2',
    transition: 'color 0.15s ease',
  },
  '.cm-foldGutter .cm-gutterElement:hover': {
    color: 'rgba(59, 130, 246, 0.8)',
  },
  '.cm-foldGutter .cm-gutterElement.cm-folded': {
    color: 'rgba(59, 130, 246, 0.9)',
  },
  // Indent guides
  '.cm-indentGuide': {
    borderLeft: '1px solid rgba(128, 128, 128, 0.3)',
  },
  '&dark .cm-indentGuide': {
    borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
  },
});

// Create a theme extension for dynamic font size
function createFontSizeTheme(fontSize: number) {
  return EditorView.theme({
    '&': {
      fontSize: `${fontSize}px`,
    },
    '.cm-gutters': {
      fontSize: `${Math.max(fontSize - 1, 10)}px`,
    },
  });
}

// Tab key mapping
const tabKeymap = keymap.of([{ key: 'Tab', run: indentMore, shift: indentLess }]);

// Markdown completions
const markdownCompletions = [
  { label: '# ', detail: '一级标题', type: 'keyword', apply: '# ' },
  { label: '## ', detail: '二级标题', type: 'keyword', apply: '## ' },
  { label: '### ', detail: '三级标题', type: 'keyword', apply: '### ' },
  { label: '**', detail: '粗体', type: 'keyword', apply: '**文本**' },
  { label: '*', detail: '斜体', type: 'keyword', apply: '*文本*' },
  { label: '~~', detail: '删除线', type: 'keyword', apply: '~~文本~~' },
  { label: '- ', detail: '无序列表', type: 'keyword', apply: '- ' },
  { label: '1. ', detail: '有序列表', type: 'keyword', apply: '1. ' },
  { label: '- [ ] ', detail: '任务列表', type: 'keyword', apply: '- [ ] ' },
  { label: '[', detail: '链接', type: 'keyword', apply: '[文本](链接)' },
  { label: '![', detail: '图片', type: 'keyword', apply: '![替代文字](图片链接)' },
  { label: '> ', detail: '引用', type: 'keyword', apply: '> ' },
  { label: '---', detail: '分割线', type: 'keyword', apply: '---\n' },
  { label: '| ', detail: '表格', type: 'keyword', apply: '| 列1 | 列2 |\n| --- | --- |\n| 内容 | 内容 |' },
];

function markdownCompletionSource(context: any) {
  const word = context.matchBefore(/[\#\*\~\`\>\-\!\[\|]*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;
  return { from: word.from, options: markdownCompletions };
}

// Get language support based on file extension
function getLanguageExtension(language?: string): Extension {
  if (!language) {
    return markdown({ base: markdownLanguage, codeLanguages: languages });
  }

  const lang = language.toLowerCase();
  
  // Check if it's a markdown file
  if (lang === 'md' || lang === 'markdown') {
    return markdown({ base: markdownLanguage, codeLanguages: languages });
  }

  // Map file extensions to language names
  const langMap: Record<string, string> = {
    js: 'JavaScript',
    jsx: 'JSX',
    ts: 'TypeScript',
    tsx: 'TSX',
    py: 'Python',
    rs: 'Rust',
    go: 'Go',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    h: 'C',
    hpp: 'C++',
    css: 'CSS',
    html: 'HTML',
    htm: 'HTML',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    xml: 'XML',
    csv: 'CSV',
    txt: 'text',
    text: 'text',
  };

  const langName = langMap[lang];
  
  // Find the language in CodeMirror language-data
  const langData = languages.find((l) => {
    if (langName && l.name === langName) return true;
    if (l.alias && l.alias.includes(lang || '')) return true;
    if (l.extensions && l.extensions.includes(lang || '')) return true;
    return false;
  });

  if (langData) {
    // Load the language support
    const support = langData.support;
    if (support) {
      return support;
    }
  }

  // Fallback to markdown
  return markdown({ base: markdownLanguage, codeLanguages: languages });
}

export function Editor({
  content,
  onChange,
  onCursorChange,
  onEditorReady,
  theme,
  language,
  fontSize: fontSizeProp,
  onSearchReady,
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onCursorChangeRef = useRef(onCursorChange);
  const onEditorReadyRef = useRef(onEditorReady);
  const onSearchReadyRef = useRef(onSearchReady);
  const minimapRef = useRef<HTMLDivElement>(null);

  onChangeRef.current = onChange;
  onCursorChangeRef.current = onCursorChange;
  onEditorReadyRef.current = onEditorReady;
  onSearchReadyRef.current = onSearchReady;

  const currentFontSize = fontSizeProp ?? DEFAULT_FONT_SIZE;

  // Initialize editor once
  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
      if (update.selectionSet || update.docChanged) {
        const pos = update.state.selection.main.head;
        const line = update.state.doc.lineAt(pos).number;
        const col = pos - update.state.doc.lineAt(pos).from + 1;
        const lineText = update.state.doc.lineAt(pos).text;
        onCursorChangeRef.current?.(line, col, lineText);
      }
      // Update minimap scroll indicator
      if (minimapRef.current) {
        const scrollDOM = update.view.scrollDOM;
        const scrollTop = scrollDOM.scrollTop;
        const scrollHeight = scrollDOM.scrollHeight;
        const clientHeight = scrollDOM.clientHeight;
        
        if (scrollHeight > clientHeight) {
          const thumbHeightPercent = (clientHeight / scrollHeight) * 100;
          const maxTop = 100 - thumbHeightPercent;
          const thumbTopPercent = maxTop > 0
            ? (scrollTop / (scrollHeight - clientHeight)) * maxTop
            : 0;
          
          minimapRef.current.style.height = `${thumbHeightPercent}%`;
          minimapRef.current.style.top = `${thumbTopPercent}%`;
          minimapRef.current.style.display = 'block';
        } else {
          minimapRef.current.style.display = 'none';
        }
      }
    });

    const extensions = [
      basicSetup,
      getLanguageExtension(language),
      updateListener,
      EditorView.lineWrapping,
      editorTheme,
      fontSizeCompartment.of(createFontSizeTheme(currentFontSize)),
      tabKeymap,
      // Explicitly add foldKeymap for code folding (Ctrl+Shift+[ / Ctrl+Shift+])
      keymap.of(foldKeymap),
      autocompletion({
        override: [markdownCompletionSource],
        activateOnTyping: true,
      }),
      search({
        top: true,
      }),
      highlightSelectionMatches(),
      // Enable browser native spellcheck
      EditorView.contentAttributes.of({ spellcheck: 'true' }),
      themeCompartment.of(theme === 'dark' ? oneDark : []),
    ];

    const state = EditorState.create({
      doc: content,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;
    view.focus();
    onEditorReadyRef.current?.(view);

    // Expose search/replace handle
    const searchHandle: EditorSearchHandle = {
      search: (query: string, options: { caseSensitive: boolean; wholeWord: boolean; useRegex: boolean }) => {
        const currentView = viewRef.current;
        if (!currentView) return;
        if (!query) {
          currentView.dispatch({ effects: setSearchQuery.of(new SearchQuery({ search: "" })) });
          return;
        }
        try {
          const escaped = options.useRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const sq = new SearchQuery({
            search: escaped,
            caseSensitive: options.caseSensitive,
            wholeWord: options.wholeWord,
            regexp: options.useRegex,
          });
          currentView.dispatch({ effects: setSearchQuery.of(sq) });
          findNext(currentView);
        } catch {
          // Invalid regex, ignore
        }
      },
      replace: (replacementText: string, replaceAllFlag: boolean) => {
        const currentView = viewRef.current;
        if (!currentView) return;
        const currentQuery = getSearchQuery(currentView.state);
        if (currentQuery) {
          const updatedQuery = new SearchQuery({
            search: currentQuery.search,
            caseSensitive: currentQuery.caseSensitive,
            wholeWord: currentQuery.wholeWord,
            regexp: currentQuery.regexp,
            replace: replacementText,
          });
          currentView.dispatch({ effects: setSearchQuery.of(updatedQuery) });
        }
        if (replaceAllFlag) {
          searchReplaceAll(currentView);
        } else {
          replaceNext(currentView);
        }
      },
      findNext: () => {
        const currentView = viewRef.current;
        if (currentView) findNext(currentView);
      },
      findPrevious: () => {
        const currentView = viewRef.current;
        if (currentView) findPrevious(currentView);
      },
    };
    onSearchReadyRef.current?.(searchHandle);

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dynamic theme switching
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: themeCompartment.reconfigure(theme === 'dark' ? oneDark : []),
    });
  }, [theme]);

  // Dynamic language switching
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: languageCompartment.reconfigure(getLanguageExtension(language)),
    });
  }, [language]);

  // Dynamic font size switching
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: fontSizeCompartment.reconfigure(createFontSizeTheme(currentFontSize)),
    });
  }, [currentFontSize]);

  // Sync content from parent
  const prevContentRef = useRef(content);
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    if (content !== prevContentRef.current && content !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: content },
      });
    }
    prevContentRef.current = content;
  }, [content]);

  return (
    <div className="relative h-full overflow-hidden">
      <div
        ref={editorRef}
        spellCheck={true}
        className="h-full overflow-hidden"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      />
      {/* Scroll position indicator (minimap-like) */}
      <div
        className="absolute right-0 top-0 bottom-0 w-[3px] opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{ zIndex: 5 }}
      >
        <div
          ref={minimapRef}
          className="absolute left-0 w-full rounded-full"
          style={{
            backgroundColor: 'rgba(128, 128, 128, 0.5)',
            minHeight: '20px',
          }}
        />
      </div>
    </div>
  );
}
