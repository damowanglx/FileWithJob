/**
 * 输入验证和清理工具
 * 用于防止 XSS 和其他安全问题
 */

// HTML 转义
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// 清理文件路径（防止路径遍历攻击）
export function sanitizePath(path: string): string {
  // 移除路径遍历字符
  return path
    .replace(/\.\./g, '')
    .replace(/~\\/g, '')
    .replace(/~\//g, '');
}

// 验证文件大小（默认最大 10MB）
export function validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size <= maxSize;
}

// 验证文件扩展名
export function validateFileExtension(
  filename: string,
  allowedExtensions: string[]
): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return allowedExtensions.includes(ext);
}

// 清理 Markdown 内容（移除潜在的危险内容）
export function sanitizeMarkdown(content: string): string {
  // 移除 script 标签
  let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // 移除事件处理器
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // 移除 javascript: 协议
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
}

// 验证内容编码
export function validateEncoding(content: string): boolean {
  // 检查是否包含有效的 UTF-8 字符
  try {
    encodeURIComponent(content);
    return true;
  } catch {
    return false;
  }
}

// 限制内容长度
export function limitContentLength(
  content: string,
  maxLength: number = 1000000
): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength);
}
