import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

/**
 * 导出预览区域为 PDF
 */
export async function exportToPdf(
  element: HTMLElement,
  filename: string = 'document.pdf',
  defaultPath?: string
): Promise<void> {
  try {
    // 显示保存对话框
    const filePath = await save({
      defaultPath: defaultPath ? `${defaultPath}\\${filename}` : filename,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
    });
    if (!filePath) return;

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
    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
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
 * 导出预览区域为 PNG 图片
 */
export async function exportToImage(
  element: HTMLElement,
  filename: string = 'document.png',
  defaultPath?: string
): Promise<void> {
  try {
    // 显示保存对话框
    const filePath = await save({
      defaultPath: defaultPath ? `${defaultPath}\\${filename}` : filename,
      filters: [{ name: 'PNG Images', extensions: ['png'] }],
    });
    if (!filePath) return;

    // 生成 Canvas
    const canvas = await html2canvas(element, {
      scale: 2,
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