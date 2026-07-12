import { forwardRef, useRef, useEffect, useMemo } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import katex from 'katex';

// 按需引入常用语言
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import markdownLang from 'highlight.js/lib/languages/markdown';
import dockerfile from 'highlight.js/lib/languages/dockerfile';

// 注册语言
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('go', go);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c', cpp);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('markdown', markdownLang);
hljs.registerLanguage('dockerfile', dockerfile);

interface PreviewProps {
  content: string;
  fileName?: string;
}

export interface PreviewRef {
  getElement: () => HTMLElement | null;
}

function getFileType(fileName?: string): 'markdown' | 'html' | 'svg' | 'json' | 'code' {
  if (!fileName) return 'markdown';
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['md', 'markdown', 'mdown', 'mkd'].includes(ext)) return 'markdown';
  if (['html', 'htm', 'xhtml'].includes(ext)) return 'html';
  if (ext === 'svg') return 'svg';
  if (['json', 'jsonc', 'json5'].includes(ext)) return 'json';
  return 'code';
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

function formatJson(content: string): string {
  try {
    return JSON.stringify(JSON.parse(content), null, 2);
  } catch {
    return content;
  }
}

// 处理数学公式
function processMath(content: string): string {
  // 处理块级公式 $$...$$ 
  content = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return `<div class="math-block">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch {
      return `<div class="math-block math-error">${escapeHtml(math)}</div>`;
    }
  });

  // 处理行内公式 $...$
  content = content.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `<span class="math-inline math-error">${escapeHtml(math)}</span>`;
    }
  });

  return content;
}

// 自定义渲染器
const renderer = new marked.Renderer();

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: true,
  renderer,
});

export const Preview = forwardRef<PreviewRef, PreviewProps>(
  ({ content, fileName }, ref) => {
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (ref) {
        (ref as any).current = {
          getElement: () => previewRef.current,
        };
      }
    }, [ref]);

    // 渲染 Mermaid 图表
    useEffect(() => {
      const renderMermaid = async () => {
        if (!previewRef.current) return;
        
        const mermaidBlocks = previewRef.current.querySelectorAll('code.language-mermaid');
        if (mermaidBlocks.length === 0) return;

        try {
          const mermaid = (await import('mermaid')).default;
          mermaid.initialize({
            startOnLoad: false,
            theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
          });

          for (const block of mermaidBlocks) {
            const pre = block.parentElement;
            if (!pre) continue;

            const container = document.createElement('div');
            container.className = 'mermaid-container';
            pre.replaceWith(container);

            try {
              const { svg } = await mermaid.render(`mermaid-${Date.now()}`, block.textContent || '');
              container.innerHTML = svg;
            } catch {
              container.innerHTML = `<div class="mermaid-error">图表渲染错误</div>`;
            }
          }
        } catch {
          console.warn('Mermaid not available');
        }
      };

      renderMermaid();
    }, [content]);

    const renderedContent = useMemo(() => {
      const fileType = getFileType(fileName);

      switch (fileType) {
        case 'html':
        case 'svg':
          return content;
        
        case 'json':
          return `<pre><code class="language-json">${escapeHtml(formatJson(content))}</code></pre>`;
        
        case 'markdown':
          try {
            // 先处理数学公式
            const withMath = processMath(content);
            // 使用 marked 的 highlight 选项
            return marked.parse(withMath) as string;
          } catch {
            return `<p style="color: red;">Markdown 解析错误</p>`;
          }
        
        default:
          return `<pre><code>${escapeHtml(content)}</code></pre>`;
      }
    }, [content, fileName]);

    return (
      <div
        ref={previewRef}
        className="preview-content"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    );
  }
);

Preview.displayName = 'Preview';
