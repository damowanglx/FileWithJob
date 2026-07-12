import { useState, useCallback } from 'react';
import { open, save, ask } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile } from './useFileOperation';
import { useNotifications } from './useNotifications';
import { useFileType, createFileFilters } from './useFileType';
import { useSettings } from './useSettings';
import { exportToPdf, exportToImage } from '../utils/export';

/**
 * 管理文件操作的 Hook
 */
export function useFileActions() {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [isModified, setIsModified] = useState(false);
  const [content, setContent] = useState('');
  const { success, error } = useNotifications();
  const { currentFileType, detectFileType } = useFileType();
  const { settings } = useSettings();

  // 标记为已修改
  const markModified = useCallback(() => {
    setIsModified(true);
  }, []);

  // 更新内容
  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
    setIsModified(true);
  }, []);

  // 确认丢弃未保存的更改
  const confirmDiscard = useCallback(async (): Promise<boolean> => {
    if (!isModified) return true;
    return await ask('当前文件未保存，是否放弃更改？', {
      title: '未保存的更改',
      kind: 'warning',
    });
  }, [isModified]);

  // 新建文件
  const handleNewFile = useCallback(async () => {
    const canProceed = await confirmDiscard();
    if (!canProceed) return;
    
    setContent('');
    setFilePath(null);
    setIsModified(false);
    detectFileType('');
  }, [confirmDiscard, detectFileType]);

  // 打开文件
  const handleOpenFile = useCallback(async () => {
    const canProceed = await confirmDiscard();
    if (!canProceed) return;

    try {
      const filters = createFileFilters();
      const selected = await open({
        multiple: false,
        filters,
      });

      if (selected) {
        const path = typeof selected === 'string' ? selected : String(selected);
        const fileContent = await readFile(path);
        setContent(fileContent);
        setFilePath(path);
        setIsModified(false);
        detectFileType(path);
        success('文件已打开', path.split(/[\/\\]/).pop() || '');
      }
    } catch (err) {
      error('打开文件失败', String(err));
    }
  }, [confirmDiscard, detectFileType, success, error]);

  // 保存文件
  const handleSaveFile = useCallback(async (): Promise<boolean> => {
    try {
      if (filePath) {
        await writeFile(filePath, content);
        setIsModified(false);
        success('保存成功', filePath.split(/[\/\\]/).pop() || '');
        return true;
      } else {
        // 另存为 - 使用设置中的默认路径
        const filters = createFileFilters();
        const defaultPath = settings.defaultSavePath || undefined;
        const path = await save({ 
          filters,
          defaultPath: defaultPath ? `${defaultPath}\\未命名.md` : undefined,
        });
        if (path) {
          await writeFile(path, content);
          setFilePath(path);
          setIsModified(false);
          detectFileType(path);
          success('保存成功', path.split(/[\/\\]/).pop() || '');
          return true;
        }
        return false;
      }
    } catch (err) {
      error('保存失败', String(err));
      return false;
    }
  }, [filePath, content, detectFileType, success, error, settings.defaultSavePath]);

  // 导出为 PDF
  const handleExportPdf = useCallback(async (previewElement?: HTMLElement | null) => {
    if (!previewElement) {
      error('导出失败', '预览区域未就绪，请确保预览面板已打开');
      return;
    }
    
    const baseName = filePath
      ? filePath.split(/[\/\\]/).pop()!.replace(/\.(md|markdown|html|json|txt)$/i, '')
      : '文档';
    
    try {
      const defaultPath = settings.defaultExportPath || undefined;
      await exportToPdf(previewElement, `${baseName}.pdf`, defaultPath);
      success('导出成功', `已导出为 ${baseName}.pdf`);
    } catch (err) {
      error('导出失败', String(err));
    }
  }, [filePath, success, error, settings.defaultExportPath]);

  // 导出为图片
  const handleExportImage = useCallback(async (previewElement?: HTMLElement | null) => {
    if (!previewElement) {
      error('导出失败', '预览区域未就绪，请确保预览面板已打开');
      return;
    }
    
    const baseName = filePath
      ? filePath.split(/[\/\\]/).pop()!.replace(/\.(md|markdown|html|json|txt)$/i, '')
      : '文档';
    
    try {
      const defaultPath = settings.defaultExportPath || undefined;
      await exportToImage(previewElement, `${baseName}.png`, defaultPath);
      success('导出成功', `已导出为 ${baseName}.png`);
    } catch (err) {
      error('导出失败', String(err));
    }
  }, [filePath, success, error, settings.defaultExportPath]);

  // 加载文件内容
  const loadContent = useCallback((newContent: string, newPath?: string | null) => {
    setContent(newContent);
    if (newPath !== undefined) {
      setFilePath(newPath);
      if (newPath) {
        detectFileType(newPath);
      }
    }
    setIsModified(false);
  }, [detectFileType]);

  return {
    // State
    filePath,
    isModified,
    content,
    currentFileType,
    
    // Actions
    updateContent,
    markModified,
    handleNewFile,
    handleOpenFile,
    handleSaveFile,
    handleExportPdf,
    handleExportImage,
    loadContent,
    setFilePath,
  };
}