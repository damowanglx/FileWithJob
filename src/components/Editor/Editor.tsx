import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState, Compartment } from "@codemirror/state";
import type { Theme } from "../../hooks/useTheme";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onCursorChange?: (line: number) => void;
  theme: Theme;
}

// Use Compartment for dynamic theme switching without recreating editor
const themeCompartment = new Compartment();

export function Editor({ content, onChange, onCursorChange, theme }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onCursorChangeRef = useRef(onCursorChange);

  onChangeRef.current = onChange;
  onCursorChangeRef.current = onCursorChange;

  // Initialize editor once
  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
      // Track cursor position
      if (update.selectionSet || update.docChanged) {
        const pos = update.state.selection.main.head;
        const line = update.state.doc.lineAt(pos).number;
        onCursorChangeRef.current?.(line);
      }
    });

    const extensions = [
      basicSetup,
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      updateListener,
      EditorView.lineWrapping,
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

    // Auto focus
    view.focus();

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only initialize once

  // Dynamic theme switching without recreating editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: themeCompartment.reconfigure(theme === "dark" ? oneDark : []),
    });
  }, [theme]);

  // Sync content from parent when file changes (e.g., file opened)
  const prevContentRef = useRef(content);
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    // Only update if content changed externally (not from typing)
    if (content !== prevContentRef.current && content !== view.state.doc.toString()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: content,
        },
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
