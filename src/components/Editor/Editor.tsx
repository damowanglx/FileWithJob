import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState, Compartment } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { indentMore, indentLess } from "@codemirror/commands";
import type { Theme } from "../../hooks/useTheme";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onCursorChange?: (line: number, col: number) => void;
  onEditorReady?: (view: EditorView) => void;
  theme: Theme;
}

const themeCompartment = new Compartment();

// Editor font and padding theme
const editorTheme = EditorView.theme({
  "&": {
    fontSize: "14px",
    height: "100%",
  },
  ".cm-content": {
    padding: "8px 0",
    fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace",
  },
  ".cm-line": {
    padding: "0 12px",
  },
  ".cm-gutters": {
    fontSize: "13px",
    minWidth: "40px",
  },
  ".cm-scroller": {
    overflow: "auto",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(59, 130, 246, 0.06)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
});

// Tab key mapping
const tabKeymap = keymap.of([
  { key: "Tab", run: indentMore, shift: indentLess },
]);

export function Editor({ content, onChange, onCursorChange, onEditorReady, theme }: EditorProps) {
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
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      updateListener,
      EditorView.lineWrapping,
      editorTheme,
      tabKeymap,
      themeCompartment.of(theme === "dark" ? oneDark : []),
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
      effects: themeCompartment.reconfigure(theme === "dark" ? oneDark : []),
    });
  }, [theme]);

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
      style={{ backgroundColor: "var(--bg-primary)" }}
    />
  );
}
