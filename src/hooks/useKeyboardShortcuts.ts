import { useEffect, useCallback } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Build shortcut key string
      const parts: string[] = [];
      if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
      if (event.shiftKey) parts.push('Shift');
      if (event.altKey) parts.push('Alt');
      
      // Add the main key
      const key = event.key.toUpperCase();
      if (!['CONTROL', 'SHIFT', 'ALT', 'META'].includes(key)) {
        parts.push(key);
      }
      
      const shortcutKey = parts.join('+');
      
      if (shortcuts[shortcutKey]) {
        event.preventDefault();
        event.stopPropagation();
        shortcuts[shortcutKey]();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

// Common shortcuts
export const SHORTCUTS = {
  NEW_FILE: 'Ctrl+N',
  OPEN_FILE: 'Ctrl+O',
  SAVE_FILE: 'Ctrl+S',
  SAVE_AS: 'Ctrl+Shift+S',
  UNDO: 'Ctrl+Z',
  REDO: 'Ctrl+Shift+Z',
  CUT: 'Ctrl+X',
  COPY: 'Ctrl+C',
  PASTE: 'Ctrl+V',
  SELECT_ALL: 'Ctrl+A',
  FIND: 'Ctrl+F',
  REPLACE: 'Ctrl+H',
  BOLD: 'Ctrl+B',
  ITALIC: 'Ctrl+I',
  TOGGLE_PREVIEW: 'Ctrl+P',
  TOGGLE_SIDEBAR: 'Ctrl+\\',
  ZOOM_IN: 'Ctrl+=',
  ZOOM_OUT: 'Ctrl+-',
  ZOOM_RESET: 'Ctrl+0',
  CLOSE_TAB: 'Ctrl+W',
  NEW_TAB: 'Ctrl+T',
  NEXT_TAB: 'Ctrl+Tab',
  PREV_TAB: 'Ctrl+Shift+Tab',
} as const;