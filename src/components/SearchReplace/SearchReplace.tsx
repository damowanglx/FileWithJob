import { useState, useCallback, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface SearchReplaceProps {
  onSearch: (query: string, options: SearchOptions) => void;
  onReplace: (replacement: string, replaceAll: boolean) => void;
  onClose: () => void;
  onOpenFile?: (path: string, lineNumber?: number) => void;
  workspacePath?: string | null;
  matchCount?: number;
  currentMatch?: number;
}

interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

interface ProjectSearchResult {
  file_path: string;
  line_number: number;
  line_content: string;
  match_start: number;
  match_end: number;
}

interface FileGroup {
  filePath: string;
  matches: ProjectSearchResult[];
  expanded: boolean;
}

type SearchTab = 'current' | 'project';

export function SearchReplace({
  onSearch,
  onReplace,
  onClose,
  onOpenFile,
  workspacePath,
  matchCount = 0,
  currentMatch = 0,
}: SearchReplaceProps) {
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>('current');
  const [options, setOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
  });

  // Project search state
  const [_projectResults, setProjectResults] = useState<ProjectSearchResult[]>([]);
  const [fileGroups, setFileGroups] = useState<FileGroup[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [totalMatches, setTotalMatches] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Current file search
  useEffect(() => {
    if (activeTab === 'current' && query) {
      onSearch(query, options);
    }
  }, [query, options, activeTab, onSearch]);

  // Project search with debounce
  const performProjectSearch = useCallback(async (searchQuery: string) => {
    if (!workspacePath || !searchQuery.trim()) {
      setProjectResults([]);
      setFileGroups([]);
      setTotalMatches(0);
      setTotalFiles(0);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await invoke<ProjectSearchResult[]>('search_in_files', {
        directory: workspacePath,
        query: searchQuery,
        caseSensitive: options.caseSensitive,
      });

      setProjectResults(results);
      setTotalMatches(results.length);

      // Group by file
      const groups = new Map<string, ProjectSearchResult[]>();
      for (const result of results) {
        const existing = groups.get(result.file_path) || [];
        existing.push(result);
        groups.set(result.file_path, existing);
      }

      const grouped: FileGroup[] = [];
      for (const [filePath, matches] of groups) {
        grouped.push({
          filePath,
          matches,
          expanded: expandedFiles.has(filePath),
        });
      }

      setFileGroups(grouped);
      setTotalFiles(grouped.length);
    } catch (err) {
      setSearchError(String(err));
      setProjectResults([]);
      setFileGroups([]);
    } finally {
      setIsSearching(false);
    }
  }, [workspacePath, options.caseSensitive, expandedFiles]);

  useEffect(() => {
    if (activeTab !== 'project') return;

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (query.trim()) {
      searchTimerRef.current = setTimeout(() => {
        performProjectSearch(query);
      }, 300);
    } else {
      setProjectResults([]);
      setFileGroups([]);
      setTotalMatches(0);
      setTotalFiles(0);
    }

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [query, activeTab, performProjectSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Enter' && activeTab === 'current') {
        onSearch(query, options);
      }
    },
    [query, options, onSearch, onClose, activeTab]
  );

  const toggleFileExpand = useCallback((filePath: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
    setFileGroups(prev =>
      prev.map(g =>
        g.filePath === filePath ? { ...g, expanded: !g.expanded } : g
      )
    );
  }, []);

  const handleResultClick = useCallback((result: ProjectSearchResult) => {
    onOpenFile?.(result.file_path, result.line_number);
  }, [onOpenFile]);

  const getFileName = (path: string) => {
    const sep = path.includes('\\') ? '\\' : '/';
    return path.split(sep).pop() || path;
  };

  const getRelativePath = (path: string) => {
    if (!workspacePath) return path;
    if (path.startsWith(workspacePath)) {
      let rel = path.substring(workspacePath.length);
      if (rel.startsWith('\\') || rel.startsWith('/')) rel = rel.substring(1);
      return rel;
    }
    return path;
  };

  const highlightMatch = (line: string, start: number, end: number) => {
    const before = line.substring(0, start);
    const match = line.substring(start, end);
    const after = line.substring(end);
    return (
      <>
        <span className="text-[var(--text-secondary)]">{before}</span>
        <span className="bg-yellow-300/40 text-[var(--text-primary)] font-semibold rounded px-0.5">{match}</span>
        <span className="text-[var(--text-secondary)]">{after}</span>
      </>
    );
  };

  // Auto-expand all files when results come in
  useEffect(() => {
    if (fileGroups.length > 0) {
      setExpandedFiles(new Set(fileGroups.map(g => g.filePath)));
    }
  }, [fileGroups.length]);

  return (
    <div
      className="absolute top-2 right-4 z-50 bg-[var(--bg-primary)] border rounded-lg shadow-xl flex flex-col"
      style={{ borderColor: 'var(--border-color)', width: 480, maxHeight: 'calc(100vh - 100px)' }}
    >
      {/* Tabs */}
      <div
        className="flex border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <button
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'current'
              ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          onClick={() => setActiveTab('current')}
        >
          ?? 当前文件
        </button>
        <button
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            activeTab === 'project'
              ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          onClick={() => setActiveTab('project')}
        >
          ?? 项目搜索
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
        >
          ?
        </button>
      </div>

      <div className="p-3">
        {/* Search input */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">??</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeTab === 'current' ? '搜索当前文件...' : '搜索项目中的所有文件...'}
            className="flex-1 px-2 py-1.5 text-sm border rounded bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            style={{ borderColor: 'var(--border-color)' }}
          />
          {activeTab === 'current' && (
            <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
              {matchCount > 0 ? `${currentMatch}/${matchCount}` : '无结果'}
            </span>
          )}
          {activeTab === 'project' && (
            <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
              {isSearching ? '搜索中...' : totalMatches > 0 ? `${totalFiles}文件 ${totalMatches}处` : query ? '无结果' : ''}
            </span>
          )}
        </div>

        {/* Search options */}
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
          {activeTab === 'current' && (
            <>
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
            </>
          )}
          {activeTab === 'current' && (
            <>
              <div className="flex-1" />
              <button
                onClick={() => setShowReplace(!showReplace)}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                {showReplace ? '隐藏替换 ▲' : '显示替换 ▼'}
              </button>
            </>
          )}
        </div>

        {/* Replace box (current file only) */}
        {activeTab === 'current' && showReplace && (
          <div className="flex items-center gap-2 mt-2 mb-2">
            <span className="text-sm">??</span>
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

        {/* No workspace warning for project search */}
        {activeTab === 'project' && !workspacePath && (
          <div className="text-xs text-[var(--text-secondary)] text-center py-4">
            ?? 请先打开一个文件夹以使用项目搜索
          </div>
        )}

        {/* Search error */}
        {searchError && (
          <div className="text-xs text-red-500 py-2">
            ? {searchError}
          </div>
        )}
      </div>

      {/* Project search results */}
      {activeTab === 'project' && fileGroups.length > 0 && (
        <div
          className="flex-1 overflow-y-auto border-t"
          style={{ borderColor: 'var(--border-color)', maxHeight: 400 }}
        >
          {fileGroups.map((group) => (
            <div key={group.filePath}>
              {/* File header */}
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium hover:bg-[var(--bg-hover)] text-left"
                onClick={() => toggleFileExpand(group.filePath)}
              >
                <span className="text-[var(--text-secondary)]">
                  {group.expanded ? '▼' : '?'}
                </span>
                <span className="text-sm">??</span>
                <span className="flex-1 truncate text-[var(--text-primary)]" title={group.filePath}>
                  {getFileName(group.filePath)}
                </span>
                <span className="text-[var(--text-secondary)] text-[10px]">
                  {getRelativePath(group.filePath)}
                </span>
                <span className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded px-1.5 py-0.5 text-[10px]">
                  {group.matches.length}
                </span>
              </button>

              {/* Matches */}
              {group.expanded && group.matches.map((result, idx) => (
                <button
                  key={`${result.file_path}-${result.line_number}-${idx}`}
                  className="w-full flex items-start gap-2 pl-8 pr-3 py-1 hover:bg-[var(--bg-hover)] text-left group"
                  onClick={() => handleResultClick(result)}
                >
                  <span className="text-[10px] text-[var(--text-secondary)] w-8 text-right shrink-0 pt-0.5 font-mono">
                    {result.line_number}
                  </span>
                  <span className="text-xs font-mono truncate text-[var(--text-primary)]">
                    {highlightMatch(result.line_content, result.match_start, result.match_end)}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

