import { useState, useCallback } from 'react';
import { open, save, ask, confirm } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile, isBinaryFile } from './useFileOperation';
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
  const { success, error, warning } = useNotifications();
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

  // 打开文件（带二进制检测）
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
        
        // 检测是否为二进制文件
        const isBinary = await isBinaryFile(path);
        if (isBinary) {
          const forceOpen = await confirm(
            '这是一个二进制文件，无法以文本方式编辑。\n\n是否强制打开？（将以十六进制显示）',
            {
              title: '二进制文件',
              kind: 'warning',
              okLabel: '强制打开',
              cancelLabel: '取消',
            }
          );
          
          if (!forceOpen) return;
          
          // 强制打开二进制文件，读取原始字节并转为十六进制显示
          try {
            const rawContent = await readFile(path);
            const hexContent = Array.from(rawContent)
              .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
              .reduce((acc, hex, i) => {
                if (i > 0 && i % 16 === 0) acc += '\n';
                if (i > 0 && i % 2 === 0) acc += ' ';
                return acc + hex;
              }, '');
            setContent(hexContent);
            setFilePath(path);
            setIsModified(false);
            detectFileType(path);
            warning('二进制文件已打开', '以十六进制显示，编辑后保存可能损坏文件');
          } catch (readErr) {
            error('读取文件失败', String(readErr));
          }
          return;
        }
        
        // 正常打开文本文件
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
  }, [confirmDiscard, detectFileType, success, error, warning]);

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
      await exportToPdf(previewElement, `${baseName}.pdf`, defaultPath, content);
      success('导出成功', `已导出为 ${baseName}.pdf`);
    } catch (err) {
      error('导出失败', String(err));
    }
  }, [filePath, content, success, error, settings.defaultExportPath]);

  // 导出为图片
  const handleExportImage = useCallback(async (previewElement?: HTMLElement | null, scale: number = 2) => {
    if (!previewElement) {
      error('导出失败', '预览区域未就绪，请确保预览面板已打开');
      return;
    }
    
    const baseName = filePath
      ? filePath.split(/[\/\\]/).pop()!.replace(/\.(md|markdown|html|json|txt)$/i, '')
      : '文档';
    
    try {
      const defaultPath = settings.defaultExportPath || undefined;
      await exportToImage(previewElement, `${baseName}.png`, defaultPath, scale);
      success('导出成功', `已导出为 ${baseName}.png (${scale}x)`);
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