import { useState, useCallback } from 'react';

// Supported file types
export interface FileType {
  name: string;
  extensions: string[];
  previewMode: 'markdown' | 'html' | 'code' | 'text';
  icon: string;
}

export const SUPPORTED_FILE_TYPES: FileType[] = [
  {
    name: 'Markdown',
    extensions: ['md', 'markdown'],
    previewMode: 'markdown',
    icon: '📝',
  },
  {
    name: 'HTML',
    extensions: ['html', 'htm'],
    previewMode: 'html',
    icon: '🌐',
  },
  {
    name: 'JSON',
    extensions: ['json'],
    previewMode: 'code',
    icon: '📋',
  },
  {
    name: 'YAML',
    extensions: ['yaml', 'yml'],
    previewMode: 'code',
    icon: '⚙️',
  },
  {
    name: 'XML',
    extensions: ['xml'],
    previewMode: 'code',
    icon: '📄',
  },
  {
    name: 'CSS',
    extensions: ['css'],
    previewMode: 'code',
    icon: '🎨',
  },
  {
    name: 'JavaScript',
    extensions: ['js', 'jsx'],
    previewMode: 'code',
    icon: '📜',
  },
  {
    name: 'TypeScript',
    extensions: ['ts', 'tsx'],
    previewMode: 'code',
    icon: '📘',
  },
  {
    name: 'Python',
    extensions: ['py'],
    previewMode: 'code',
    icon: '🐍',
  },
  {
    name: 'Rust',
    extensions: ['rs'],
    previewMode: 'code',
    icon: '🦀',
  },
  {
    name: 'Go',
    extensions: ['go'],
    previewMode: 'code',
    icon: '🐹',
  },
  {
    name: 'Java',
    extensions: ['java'],
    previewMode: 'code',
    icon: '☕',
  },
  {
    name: 'C/C++',
    extensions: ['c', 'cpp', 'h', 'hpp'],
    previewMode: 'code',
    icon: '⚙️',
  },
  {
    name: 'CSV',
    extensions: ['csv'],
    previewMode: 'text',
    icon: '📊',
  },
  {
    name: '文本文件',
    extensions: ['txt', 'text'],
    previewMode: 'text',
    icon: '📄',
  },
];

// Get file type by extension
export function getFileTypeByExtension(filename: string): FileType | undefined {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return undefined;
  return SUPPORTED_FILE_TYPES.find((type) => type.extensions.includes(ext));
}

// Get all supported extensions
export function getAllSupportedExtensions(): string[] {
  return SUPPORTED_FILE_TYPES.flatMap((type) => type.extensions);
}

// Create file filters for dialog
export function createFileFilters() {
  const filters = SUPPORTED_FILE_TYPES.map((type) => ({
    name: `${type.name} (${type.extensions.map((e) => `.${e}`).join(', ')})`,
    extensions: type.extensions,
  }));
  
  filters.push({
    name: '所有文件',
    extensions: ['*'],
  });
  
  return filters;
}

// Hook for file type management
export function useFileType() {
  const [currentFileType, setCurrentFileType] = useState<FileType | null>(null);

  const detectFileType = useCallback((filename: string) => {
    const fileType = getFileTypeByExtension(filename);
    setCurrentFileType(fileType || null);
    return fileType;
  }, []);

  return {
    currentFileType,
    detectFileType,
    supportedTypes: SUPPORTED_FILE_TYPES,
  };
}