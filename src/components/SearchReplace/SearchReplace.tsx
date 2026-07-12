import { useState, useCallback, useEffect, useRef } from 'react';

interface SearchReplaceProps {
  onSearch: (query: string, options: SearchOptions) => void;
  onReplace: (replacement: string, replaceAll: boolean) => void;
  onClose: () => void;
  matchCount?: number;
  currentMatch?: number;
}

interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export function SearchReplace({
  onSearch,
  onReplace,
  onClose,
  matchCount = 0,
  currentMatch = 0,
}: SearchReplaceProps) {
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [options, setOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query) {
      onSearch(query, options);
    }
  }, [query, options, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Enter') {
        if (e.shiftKey) {
          // 上一个
          onSearch(query, options);
        } else {
          onSearch(query, options);
        }
      }
    },
    [query, options, onSearch, onClose]
  );

  return (
    <div
      className="absolute top-2 right-4 z-50 bg-[var(--bg-primary)] border rounded-lg shadow-xl p-3"
      style={{ borderColor: 'var(--border-color)', width: 380 }}
    >
      {/* 搜索框 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索..."
          className="flex-1 px-2 py-1.5 text-sm border rounded bg-[var(--bg-secondary)] text-[var(--text-primary)]"
          style={{ borderColor: 'var(--border-color)' }}
        />
        <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
          {matchCount > 0 ? `${currentMatch}/${matchCount}` : '无结果'}
        </span>
      </div>

      {/* 搜索选项 */}
      <div className="flex items-center gap-2 mb-2">
        <label className="flex items-center gap-1 text-xs text-[var(--text-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={options.caseSensitive}
            onChange={(e) =>
              setOptions({ ...options, caseSensitive: e.target.checked })
            }
            className="rounded"
          />
          区分大小写
        </label>
        <label className="flex items-center gap-1 text-xs text-[var(--text-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={options.wholeWord}
            onChange={(e) =>
              setOptions({ ...options, wholeWord: e.target.checked })
            }
            className="rounded"
          />
          全词匹配
        </label>
        <label className="flex items-center gap-1 text-xs text-[var(--text-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={options.useRegex}
            onChange={(e) =>
              setOptions({ ...options, useRegex: e.target.checked })
            }
            className="rounded"
          />
          正则表达式
        </label>
        <div className="flex-1" />
        <button
          onClick={() => setShowReplace(!showReplace)}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          {showReplace ? '隐藏替换 ▲' : '显示替换 ▼'}
        </button>
      </div>

      {/* 替换框 */}
      {showReplace && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm">🔄</span>
          <input
            type="text"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="替换为..."
            className="flex-1 px-2 py-1.5 text-sm border rounded bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            style={{ borderColor: 'var(--border-color)' }}
          />
          <button
            onClick={() => onReplace(replacement, false)}
            className="px-2 py-1.5 text-xs rounded bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            title="替换当前"
          >
            替换
          </button>
          <button
            onClick={() => onReplace(replacement, true)}
            className="px-2 py-1.5 text-xs rounded bg-[var(--accent-color)] text-white hover:opacity-90"
            title="全部替换"
          >
            全部
          </button>
        </div>
      )}

      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
      >
        ✕
      </button>
    </div>
  );
}
