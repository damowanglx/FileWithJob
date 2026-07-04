import { useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import { parseMarkdown } from "../../utils/markdown";
import "../../styles/preview.css";

interface PreviewProps {
  content: string;
}

export interface PreviewRef {
  getElement: () => HTMLDivElement | null;
}

export const Preview = forwardRef<PreviewRef, PreviewProps>(function Preview(
  { content },
  ref
) {
  const previewRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getElement: () => previewRef.current,
  }));

  const html = useMemo(() => {
    if (!content.trim()) return "";
    try {
      return parseMarkdown(content);
    } catch (err) {
      return `<p style="color: var(--text-secondary); font-style: italic;">渲染出错: ${err}</p>`;
    }
  }, [content]);

  if (!content.trim()) {
    return (
      <div
        ref={previewRef}
        className="h-full flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-secondary)" }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-lg mb-2">在左侧编辑器中输入 Markdown</p>
          <p className="text-sm opacity-70">支持标题、列表、代码块、表格等语法</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={previewRef}
      className="markdown-preview h-full overflow-y-auto"
      style={{ backgroundColor: "var(--bg-primary)" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
