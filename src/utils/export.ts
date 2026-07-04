import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Export preview area as PDF
 */
export async function exportToPdf(
  element: HTMLElement,
  filename: string = "document.pdf"
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--bg-primary").trim() || "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pdfWidth - 20; // 10mm margin on each side
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 10; // Top margin

  pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight + 10;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(filename);
}

/**
 * Export preview area as PNG image
 */
export async function exportToImage(
  element: HTMLElement,
  filename: string = "document.png"
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--bg-primary").trim() || "#ffffff",
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
