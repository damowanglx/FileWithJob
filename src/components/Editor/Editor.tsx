import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState, Compartment } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { indentMore, indentLess } from '@codemirror/commands';
import { autocompletion } from '@codemirror/autocomplete';
import type { Extension } from '@codemirror/state';
import type { Theme } from '../../hooks/useTheme';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onCursorChange?: (line: number, col: number) => void;
  onEditorReady?: (view: EditorView) => void;
  theme: Theme;
  language?: string;
}

const themeCompartment = new Compartment();
const languageCompartment = new Compartment();

// Editor font and padding theme
const editorTheme = EditorView.theme({
  '&': {
    fontSize: '14px',
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
    fontSize: '13px',
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
});

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
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onCursorChangeRef = useRef(onCursorChange);
  const onEditorReadyRef = useRef(onEditorReady);

  onChangeRef.current = onChange;
  onCursorChangeRef.current = onCursorChange;
  onEditorReadyRef.current = onEditorReady;

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
        onCursorChangeRef.current?.(line, col);
      }
    });

    const extensions = [
      basicSetup,
      getLanguageExtension(language),
      updateListener,
      EditorView.lineWrapping,
      editorTheme,
      tabKeymap,
      autocompletion({
        override: [markdownCompletionSource],
        activateOnTyping: true,
      }),
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
    <div
      ref={editorRef}
      className="h-full overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    />
  );
}