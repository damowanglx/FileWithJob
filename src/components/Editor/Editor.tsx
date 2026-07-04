import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState } from "@codemirror/state";
import type { Theme } from "../../hooks/useTheme";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  theme: Theme;
}

export function Editor({ content, onChange, theme }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  // Keep callback ref updated
  onChangeRef.current = onChange;

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const extensions = [
      basicSetup,
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      updateListener,
      EditorView.lineWrapping,
    ];

    if (theme === "dark") {
      extensions.push(oneDark);
    }

    const state = EditorState.create({
      doc: content,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]); // Recreate editor when theme changes

  // Sync content from parent when file changes
  const prevContentRef = useRef(content);
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    // Only update if content changed externally (e.g., file opened)
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
