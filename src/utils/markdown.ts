import { marked } from "marked";
import hljs from "highlight.js";

// Configure marked with highlight.js
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Custom renderer for code blocks with syntax highlighting
const renderer = new marked.Renderer();

renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
  const highlighted = hljs.highlight(text, { language }).value;
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
};

marked.use({ renderer });

/**
 * Parse markdown string to HTML
 */
export function parseMarkdown(content: string): string {
  return marked.parse(content) as string;
}
