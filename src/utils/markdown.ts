import { marked } from "marked";
import hljs from "highlight.js";

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Custom renderer
marked.use({
  renderer: {
    // Add anchor links to headings
    heading({ text, depth }: { text: string; depth: number }): string {
      const id = text
        .toLowerCase()
        .replace(/<[^>]*>/g, "")
        .replace(/[^\w一-鿿]+/g, "-")
        .replace(/^-+|-+$/g, "");
      return `<h${depth} id="${id}"><a class="heading-anchor" href="#${id}">#</a>${text}</h${depth}>`;
    },

    // Add syntax highlighting, copy button, and language label to code blocks
    code({ text, lang }: { text: string; lang?: string | null }): string {
      const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      const highlighted = hljs.highlight(text, { language }).value;
      const langLabel = lang ? `<span class="code-lang-label">${lang}</span>` : "";
      return `<pre>${langLabel}<code class="hljs language-${language}">${highlighted}</code><button class="code-copy-btn" data-code="${encodeURIComponent(text)}">复制</button></pre>`;
    },

    // Support local images with error handling
    image({ href, title, text }: { href: string; title?: string | null; text: string }): string {
      const titleAttr = title ? ` title="${title}"` : "";
      return `<img src="${href}" alt="${text}"${titleAttr} loading="lazy" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span style=\\'color:#ef4444;font-size:12px\\'>图片加载失败: ${text}</span>')" />`;
    },
  },
});

// Setup copy button event delegation
if (typeof document !== "undefined") {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("code-copy-btn")) {
      const code = decodeURIComponent(target.getAttribute("data-code") || "");
      navigator.clipboard.writeText(code).then(() => {
        target.textContent = "已复制";
        setTimeout(() => { target.textContent = "复制"; }, 1500);
      }).catch(() => {
        target.textContent = "复制失败";
        setTimeout(() => { target.textContent = "复制"; }, 1500);
      });
    }
  });
}

/**
 * Parse markdown string to HTML
 */
export function parseMarkdown(content: string): string {
  if (!content) return "";
  try {
    return marked.parse(content) as string;
  } catch (err) {
    return `<p style="color: #ef4444;">Markdown 解析错误: ${err}</p>`;
  }
}
