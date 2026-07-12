import { RecentFile } from '../../hooks/useRecentFiles';

interface WelcomePageProps {
  recentFiles: RecentFile[];
  onFileSelect: (path: string) => void;
  onNewFile: () => void;
  onOpenFile: () => void;
  onOpenFolder: () => void;
  onRemoveRecent: (path: string) => void;
  onTogglePin: (path: string) => void;
}

export function WelcomePage({
  recentFiles,
  onFileSelect,
  onNewFile,
  onOpenFile,
  onOpenFolder,
  onRemoveRecent,
  onTogglePin,
}: WelcomePageProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const iconMap: Record<string, string> = {
      md: '📝',
      markdown: '📝',
      txt: '📄',
      json: '📋',
      js: '📜',
      ts: '📘',
    };
    return iconMap[ext] || '📄';
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="max-w-2xl w-full px-8">
        {/* Logo 和标题 */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            FileWithJob
          </h1>
          <p className="text-[var(--text-secondary)]">
            轻量级 Markdown 编辑器
          </p>
        </div>

        {/* 快捷操作 */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <button
            onClick={onNewFile}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border hover:border-[var(--accent-color)] hover:bg-[var(--bg-hover)] transition-all group"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">
              📄
            </span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              新建文件
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              Ctrl+N
            </span>
          </button>

          <button
            onClick={onOpenFile}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border hover:border-[var(--accent-color)] hover:bg-[var(--bg-hover)] transition-all group"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">
              📂
            </span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              打开文件
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              Ctrl+O
            </span>
          </button>

          <button
            onClick={onOpenFolder}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border hover:border-[var(--accent-color)] hover:bg-[var(--bg-hover)] transition-all group"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">
              📁
            </span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              打开文件夹
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              浏览文件树
            </span>
          </button>
        </div>

        {/* 最近文件 */}
        {recentFiles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-[var(--text-secondary)]">
                最近打开
              </h2>
              <button
                onClick={() => onRemoveRecent('all')}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                清除
              </button>
            </div>

            <div
              className="border rounded-lg overflow-hidden"
              style={{ borderColor: 'var(--border-color)' }}
            >
              {recentFiles.slice(0, 8).map((file, index) => (
                <div
                  key={file.path}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors ${
                    index < recentFiles.length - 1 ? 'border-b' : ''
                  }`}
                  style={{ borderColor: 'var(--border-color)' }}
                  onClick={() => onFileSelect(file.path)}
                >
                  <span className="text-lg flex-shrink-0">
                    {getFileIcon(file.name)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {file.name}
                      </span>
                      {file.isPinned && (
                        <span className="text-xs text-[var(--accent-color)]">
                          📌
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] truncate block">
                      {file.path}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] flex-shrink-0">
                    {formatDate(file.lastOpened)}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(file.path);
                      }}
                      className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                      title={file.isPinned ? '取消置顶' : '置顶'}
                    >
                      {file.isPinned ? '📌' : '📍'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRecent(file.path);
                      }}
                      className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                      title="移除"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 快捷键提示 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[var(--text-secondary)]">
            快捷键: Ctrl+N 新建 | Ctrl+O 打开 | Ctrl+S 保存 | Ctrl+P 预览
          </p>
        </div>
      </div>
    </div>
  );
}
