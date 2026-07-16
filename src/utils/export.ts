import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

/**
 * 解析 Markdown 内容中的标题，返回 { level, text, yPosition }[]
 * 用于生成 PDF 书签
 */
function parseMarkdownHeadings(markdown: string): Array<{ level: number; text: string }> {
  const headings: Array<{ level: number; text: string }> = [];
  const lines = markdown.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`~\[\]]/g, '').trim();
      headings.push({ level, text });
    }
  }
  
  return headings;
}

/**
 * 导出预览区域为 PDF，支持页眉页脚和目录书签
 */
export async function exportToPdf(
  element: HTMLElement,
  filename: string = 'document.pdf',
  defaultPath?: string,
  markdownContent?: string
): Promise<void> {
  try {
    // 显示保存对话框
    const filePath = await save({
      defaultPath: defaultPath ? `${defaultPath}\\${filename}` : filename,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
    });
    if (!filePath) return;

    // 获取文件名（不含扩展名）用于页眉
    const displayName = filename.replace(/\.pdf$/i, '');

    // 生成 Canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor:
        getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() ||
        '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // 页眉页脚区域高度
    const headerHeight = 12;
    const footerHeight = 12;
    const marginTop = headerHeight + 4; // 页眉下方留白
    const marginBottom = footerHeight + 2; // 页脚上方留白
    const contentAreaHeight = pdfHeight - marginTop - marginBottom;
    
    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // 计算总页数
    let totalPages = 1;
    let tempHeightLeft = imgHeight;
    while (tempHeightLeft > contentAreaHeight) {
      totalPages++;
      tempHeightLeft -= contentAreaHeight;
    }
    
    let heightLeft = imgHeight;
    let position = marginTop;
    let currentPage = 1;

    // 解析标题用于书签
    const headings = markdownContent ? parseMarkdownHeadings(markdownContent) : [];
    
    // 创建书签根节点
    let bookmarkRoot: any = null;
    if (headings.length > 0) {
      try {
        bookmarkRoot = pdf.outline.add(null, '目录', { pageNumber: 1 });
      } catch {
        // outline API 不可用时忽略
      }
    }

    // 添加第一页内容
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= contentAreaHeight;

    // 添加页眉页脚到每一页
    const addHeaderFooter = (page: number) => {
      // 设置灰色
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(8);
      
      // 页眉：文件名左对齐
      pdf.text(displayName, 10, 8);
      
      // 页眉：页码右对齐
      const pageText = `${page} / ${totalPages}`;
      const pageTextWidth = pdf.getTextWidth(pageText);
      pdf.text(pageText, pdfWidth - 10 - pageTextWidth, 8);
      
      // 页眉分隔线
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(10, headerHeight, pdfWidth - 10, headerHeight);
      
      // 页脚：页码居中
      const footerText = `第 ${page} 页 / 共 ${totalPages} 页`;
      const footerTextWidth = pdf.getTextWidth(footerText);
      pdf.text(footerText, (pdfWidth - footerTextWidth) / 2, pdfHeight - 5);
      
      // 页脚分隔线
      pdf.line(10, pdfHeight - footerHeight, pdfWidth - 10, pdfHeight - footerHeight);
      
      // 恢复黑色
      pdf.setTextColor(0, 0, 0);
    };

    // 为第一页添加页眉页脚
    addHeaderFooter(1);

    // 为后续页面添加内容和页眉页脚
    while (heightLeft > 0) {
      currentPage++;
      position = heightLeft - imgHeight + marginTop;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      addHeaderFooter(currentPage);
      heightLeft -= contentAreaHeight;
    }

    // 添加 PDF 书签（目录结构）
    if (headings.length > 0) {
      // 为每个标题添加书签，根据标题数量均匀分配到页面
      const headingsPerPage = Math.ceil(headings.length / totalPages);
      
      // 跟踪各层级的最后一个书签，用于创建层级结构
      const levelBookmarks: Record<number, any> = { 0: bookmarkRoot };
      
      headings.forEach((heading, index) => {
        const targetPage = Math.min(Math.floor(index / headingsPerPage) + 1, totalPages);
        
        try {
          // 找到父级书签（上一层级的最后一个书签）
          let parent = bookmarkRoot;
          for (let lvl = heading.level - 1; lvl >= 1; lvl--) {
            if (levelBookmarks[lvl]) {
              parent = levelBookmarks[lvl];
              break;
            }
          }
          
          // 添加书签
          const bookmark = pdf.outline.add(parent, heading.text, { pageNumber: targetPage });
          
          // 更新当前层级的书签引用
          levelBookmarks[heading.level] = bookmark;
          
          // 清除更深层级的引用（新的同级标题）
          for (let lvl = heading.level + 1; lvl <= 6; lvl++) {
            delete levelBookmarks[lvl];
          }
        } catch {
          // 如果书签创建失败，跳过
        }
      });
    }

    // 保存文件
    const pdfData = pdf.output('arraybuffer');
    await writeFile(filePath, new Uint8Array(pdfData));
  } catch (err) {
    console.error('Failed to export PDF:', err);
    throw err;
  }
}

/**
 * 导出预览区域为 PNG 图片，支持自定义分辨率
 */
export async function exportToImage(
  element: HTMLElement,
  filename: string = 'document.png',
  defaultPath?: string,
  scale: number = 2
): Promise<void> {
  try {
    // 显示保存对话框
    const filePath = await save({
      defaultPath: defaultPath ? `${defaultPath}\\${filename}` : filename,
      filters: [{ name: 'PNG Images', extensions: ['png'] }],
    });
    if (!filePath) return;

    // 生成 Canvas，使用传入的 scale 参数
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      backgroundColor:
        getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() ||
        '#ffffff',
    });

    // 转换为 Blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
        },
        'image/png'
      );
    });

    // 保存文件
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    await writeFile(filePath, uint8Array);
  } catch (err) {
    console.error('Failed to export image:', err);
    throw err;
  }
}

