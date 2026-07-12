import { useState, useCallback } from 'react';

type Locale = 'zh-CN' | 'en-US';

interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<Locale, Translations> = {
  'zh-CN': {
    common: {
      new: '新建',
      open: '打开',
      save: '保存',
      saveAs: '另存为',
      close: '关闭',
      undo: '撤销',
      redo: '重做',
      cut: '剪切',
      copy: '复制',
      paste: '粘贴',
      selectAll: '全选',
      find: '查找',
      replace: '替换',
      settings: '设置',
      help: '帮助',
      about: '关于',
    },
    editor: {
      title: '编辑器',
      modified: '已修改',
      line: '行',
      column: '列',
      characters: '字符',
      words: '词',
    },
    preview: {
      title: '预览',
      hide: '隐藏预览',
      show: '显示预览',
    },
    toolbar: {
      bold: '加粗',
      italic: '斜体',
      strikethrough: '删除线',
      heading: '标题',
      list: '列表',
      link: '链接',
      image: '图片',
      code: '代码',
      quote: '引用',
      table: '表格',
      hr: '分割线',
    },
    export: {
      pdf: '导出 PDF',
      image: '导出图片',
    },
    theme: {
      light: '亮色主题',
      dark: '暗色主题',
      toggle: '切换主题',
    },
    notifications: {
      saved: '文件已保存',
      error: '错误',
      warning: '警告',
      info: '信息',
    },
  },
  'en-US': {
    common: {
      new: 'New',
      open: 'Open',
      save: 'Save',
      saveAs: 'Save As',
      close: 'Close',
      undo: 'Undo',
      redo: 'Redo',
      cut: 'Cut',
      copy: 'Copy',
      paste: 'Paste',
      selectAll: 'Select All',
      find: 'Find',
      replace: 'Replace',
      settings: 'Settings',
      help: 'Help',
      about: 'About',
    },
    editor: {
      title: 'Editor',
      modified: 'Modified',
      line: 'Line',
      column: 'Column',
      characters: 'Characters',
      words: 'Words',
    },
    preview: {
      title: 'Preview',
      hide: 'Hide Preview',
      show: 'Show Preview',
    },
    toolbar: {
      bold: 'Bold',
      italic: 'Italic',
      strikethrough: 'Strikethrough',
      heading: 'Heading',
      list: 'List',
      link: 'Link',
      image: 'Image',
      code: 'Code',
      quote: 'Quote',
      table: 'Table',
      hr: 'Horizontal Rule',
    },
    export: {
      pdf: 'Export PDF',
      image: 'Export Image',
    },
    theme: {
      light: 'Light Theme',
      dark: 'Dark Theme',
      toggle: 'Toggle Theme',
    },
    notifications: {
      saved: 'File saved',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
    },
  },
};

export function useI18n() {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem('filewithjob_locale');
      if (saved && (saved === 'zh-CN' || saved === 'en-US')) {
        return saved;
      }
    } catch {
      // Ignore
    }
    return 'zh-CN';
  });

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let value: any = translations[locale];

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key; // Return key if translation not found
        }
      }

      if (typeof value !== 'string') {
        return key;
      }

      // Replace parameters
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
          return params[paramKey]?.toString() || '';
        });
      }

      return value;
    },
    [locale]
  );

  const changeLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    try {
      localStorage.setItem('filewithjob_locale', newLocale);
    } catch {
      // Ignore
    }
  }, []);

  return {
    locale,
    t,
    changeLocale,
  };
}