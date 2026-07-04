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

  const html = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div
      ref={previewRef}
      className="markdown-preview h-full overflow-y-auto"
      style={{ backgroundColor: "var(--bg-primary)" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
