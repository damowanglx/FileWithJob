/**
 * 路径处理和兼容性工具
 */

// 统一路径分隔符（Windows 和 Unix）
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

// 获取文件名
export function getFileName(path: string): string {
  return path.split(/[\/\\]/).pop() || '';
}

// 获取文件扩展名
export function getFileExtension(path: string): string {
  const fileName = getFileName(path);
  return fileName.split('.').pop()?.toLowerCase() || '';
}

// 获取文件名（不含扩展名）
export function getFileNameWithoutExtension(path: string): string {
  const fileName = getFileName(path);
  const lastDot = fileName.lastIndexOf('.');
  return lastDot > 0 ? fileName.substring(0, lastDot) : fileName;
}

// 检查路径是否为绝对路径
export function isAbsolutePath(path: string): boolean {
  // Windows: C:\, D:\, \\
  // Unix: /
  return /^[A-Za-z]:\\/.test(path) || path.startsWith('/') || path.startsWith('\\\\');
}

// 连接路径
export function joinPath(...parts: string[]): string {
  return parts
    .map((part, index) => {
      if (index === 0) {
        return part.replace(/[\/\\]+$/, '');
      }
      return part.replace(/^[\/\\]+/, '').replace(/[\/\\]+$/, '');
    })
    .filter(Boolean)
    .join('/');
}

// 检测文件编码（简化版）
export function detectEncoding(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  
  // UTF-8 BOM
  if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    return 'utf-8-bom';
  }
  
  // UTF-16 LE BOM
  if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
    return 'utf-16le';
  }
  
  // UTF-16 BE BOM
  if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
    return 'utf-16be';
  }
  
  // 简单的 UTF-8 检测
  let isUtf8 = true;
  let i = 0;
  while (i < bytes.length) {
    if (bytes[i] < 0x80) {
      i++;
    } else if ((bytes[i] & 0xE0) === 0xC0) {
      if (i + 1 >= bytes.length || (bytes[i + 1] & 0xC0) !== 0x80) {
        isUtf8 = false;
        break;
      }
      i += 2;
    } else if ((bytes[i] & 0xF0) === 0xE0) {
      if (i + 2 >= bytes.length || (bytes[i + 1] & 0xC0) !== 0x80 || (bytes[i + 2] & 0xC0) !== 0x80) {
        isUtf8 = false;
        break;
      }
      i += 3;
    } else if ((bytes[i] & 0xF8) === 0xF0) {
      if (i + 3 >= bytes.length || (bytes[i + 1] & 0xC0) !== 0x80 || (bytes[i + 2] & 0xC0) !== 0x80 || (bytes[i + 3] & 0xC0) !== 0x80) {
        isUtf8 = false;
        break;
      }
      i += 4;
    } else {
      isUtf8 = false;
      break;
    }
  }
  
  return isUtf8 ? 'utf-8' : 'ascii';
}

// 检测换行符类型
export function detectLineEnding(content: string): 'CRLF' | 'LF' | 'CR' {
  const crlfCount = (content.match(/\r\n/g) || []).length;
  const lfCount = (content.match(/(?<!\r)\n/g) || []).length;
  const crCount = (content.match(/\r(?!\n)/g) || []).length;
  
  if (crlfCount >= lfCount && crlfCount >= crCount) return 'CRLF';
  if (lfCount >= crCount) return 'LF';
  return 'CR';
}

// 统一换行符为 LF
export function normalizeLineEndings(content: string): string {
  return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
