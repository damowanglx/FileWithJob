import { marked } from "marked";
import hljs from "highlight.js";

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Custom renderer for code blocks with syntax highlighting
marked.use({
  renderer: {
    code({ text, lang }: { text: string; lang?: string | null }): string {
      const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      const highlighted = hljs.highlight(text, { language }).value;
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    },
  },
});

/**
 * Parse markdown string to HTML
 */
export function parseMarkdown(content: string): string {
  if (!content) return "";
  return marked.parse(content) as string;
}
