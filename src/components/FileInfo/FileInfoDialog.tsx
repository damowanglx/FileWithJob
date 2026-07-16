import { useState, useEffect } from 'react';
import { getFileInfo, DetailedFileInfo } from '../../hooks/useFileOperation';

interface FileInfoDialogProps {
  isOpen: boolean;
  filePath: string | null;
  onClose: () => void;
}

/**
 * 格式化文件大小
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * 格式化时间戳为可读日期
 */
function formatDate(timestamp: number): string {
  if (timestamp === 0) return '-';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * 获取文件类型图标
 */
function getFileIcon(name: string, isDir: boolean): string {
  if (isDir) return '??';
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const iconMap: Record<string, string> = {
    md: '??', markdown: '??', txt: '??', json: '??',
    js: '??', jsx: '??', ts: '??', tsx: '??',
    css: '??', html: '??', svg: '???', png: '???',
    jpg: '???', gif: '???', pdf: '??', zip: '??',
    rs: '??', go: '??', py: '??', java: '?',
  };
  return iconMap[ext] || '??';
}

export function FileInfoDialog({ isOpen, filePath, onClose }: FileInfoDialogProps) {
  const [fileInfo, setFileInfo] = useState<DetailedFileInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !filePath) {
      setFileInfo(null);
      setError(null);
      return;
    }

    const loadInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const info = await getFileInfo(filePath);
        setFileInfo(info);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    loadInfo();
  }, [isOpen, filePath]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div
        className="bg-[var(--bg-primary)] rounded-lg shadow-xl w-full max-w-lg border"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {/* 标题栏 */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            ?? 文件属性
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
          >
            ?
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center py-8 text-[var(--text-secondary)]">
              <span className="animate-spin mr-2">?</span>
              加载中...
            </div>
          )}

          {error && (
            <div className="py-4 text-center text-red-500">
              ? {error}
            </div>
          )}

          {fileInfo && (
            <div className="space-y-3">
              {/* 文件图标和名称 */}
              <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-3xl">
                  {getFileIcon(fileInfo.name, fileInfo.is_dir)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium text-[var(--text-primary)] truncate">
                    {fileInfo.name}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] truncate">
                    {fileInfo.extension ? `.${fileInfo.extension}` : (fileInfo.is_dir ? '文件夹' : '未知类型')}
                  </div>
                </div>
              </div>

              {/* 详细信息 */}
              <div className="space-y-2">
                <InfoRow label="?? 类型" value={fileInfo.is_dir ? '文件夹' : '文件'} />
                <InfoRow label="?? 扩展名" value={fileInfo.extension ? `.${fileInfo.extension}` : '-'} />
                <InfoRow label="?? 大小" value={formatSize(fileInfo.size)} />
                <InfoRow label="?? 创建时间" value={formatDate(fileInfo.created)} />
                <InfoRow label="?? 修改时间" value={formatDate(fileInfo.modified)} />
                <InfoRow
                  label="?? 只读"
                  value={fileInfo.readonly ? '是' : '否'}
                  valueClass={fileInfo.readonly ? 'text-orange-500' : ''}
                />
              </div>

              {/* 完整路径 */}
              <div
                className="mt-3 p-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-sidebar)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="text-xs font-medium text-[var(--text-secondary)] mb-1">
                  完整路径
                </div>
                <div className="text-sm text-[var(--text-primary)] break-all font-mono">
                  {fileInfo.path}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div
          className="flex justify-end px-4 py-3 border-t"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-[var(--accent-color)] text-white hover:opacity-90"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 信息行组件
 */
function InfoRow({
  label,
  value,
  valueClass = '',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <span className={`text-sm text-[var(--text-primary)] ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}