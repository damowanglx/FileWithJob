import { useState, useCallback, useEffect } from 'react';

export interface Settings {
  // 编辑器设置
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: 'on' | 'off';
  showLineNumbers: boolean;
  highlightActiveLine: boolean;
  bracketMatching: boolean;
  autoCloseBrackets: boolean;
  lineWrapping: boolean;
  
  // 主题设置
  theme: 'light' | 'dark' | 'system';
  editorTheme: 'default' | 'monokai' | 'dracula' | 'solarized' | 'one-dark-pro' | 'solarized-light';
  
  // 文件设置
  defaultSavePath: string;
  defaultExportPath: string;
  autoSave: boolean;
  autoSaveDelay: number;
  encoding: string;
  lineEnding: 'LF' | 'CRLF';
  
  // 预览设置
  showPreview: boolean;
  syncScroll: boolean;
  previewTheme: 'light' | 'dark' | 'auto';
  
  // 编辑器行为
  smoothScrolling: boolean;
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
  cursorStyle: 'line' | 'block' | 'underline';
  
  // 高级设置
  hardwareAcceleration: boolean;
}

const defaultSettings: Settings = {
  // 编辑器设置
  fontSize: 14,
  fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace",
  tabSize: 2,
  wordWrap: 'on',
  showLineNumbers: true,
  highlightActiveLine: true,
  bracketMatching: true,
  autoCloseBrackets: true,
  lineWrapping: true,
  
  // 主题设置
  theme: 'system',
  editorTheme: 'default',
  
  // 文件设置
  defaultSavePath: '',
  defaultExportPath: '',
  autoSave: true,
  autoSaveDelay: 1000,
  encoding: 'UTF-8',
  lineEnding: 'LF',
  
  // 预览设置
  showPreview: true,
  syncScroll: true,
  previewTheme: 'auto',
  
  // 编辑器行为
  smoothScrolling: true,
  cursorBlinking: 'blink',
  cursorStyle: 'line',
  
  // 高级设置
  hardwareAcceleration: true,
};

const SETTINGS_KEY = 'filewithjob_settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore parse errors
    }
    return defaultSettings;
  });

  // 保存设置到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [settings]);

  const updateSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return {
    settings,
    updateSetting,
    resetSettings,
  };
}