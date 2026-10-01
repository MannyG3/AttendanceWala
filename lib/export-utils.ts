import ExcelJS from "exceljs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateExcelReport(
  title: string,
  headers: string[],
  rows: (string | number)[][]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Attendance Report");

  // Title Row
  worksheet.mergeCells(1, 1, 1, Math.max(headers.length, 4));
  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = `RIT Polytechnic — ${title}`;
  titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 30;

  // Header Row
  const headerRow = worksheet.addRow(headers);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  // Data Rows
  rows.forEach((rowValues) => {
    const row = worksheet.addRow(rowValues);
    row.height = 20;
    row.eachCell((cell) => {
      cell.font = { name: "Arial", size: 10 };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });
  });

  // Auto-fit column widths
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? String(cell.value).length : 10;
      if (columnLength > maxLength) maxLength = columnLength;
    });
    column.width = Math.min(maxLength + 4, 35);
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

export async function generatePdfReport(
  title: string,
  headers: string[],
  rows: (string | number)[][]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  let y = height - 40;

  // Header Banner
  page.drawRectangle({
    x: 30,
    y: y - 30,
    width: width - 60,
    height: 40,
    color: rgb(0.117, 0.227, 0.541),
  });

  page.drawText(`RIT Polytechnic — ${title}`, {
    x: 45,
    y: y - 10,
    size: 14,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  y -= 60;

  // Table Headers
  const colWidth = (width - 60) / Math.max(headers.length, 1);

  page.drawRectangle({
    x: 30,
    y: y - 18,
    width: width - 60,
    height: 22,
    color: rgb(0.145, 0.388, 0.921),
  });

  headers.forEach((header, index) => {
    page.drawText(String(header), {
      x: 35 + index * colWidth,
      y: y - 12,
      size: 9,
      font: boldFont,
      color: rgb(1, 1, 1),
    });
  });

  y -= 26;

  // Rows
  rows.slice(0, 35).forEach((rowValues) => {
    if (y < 40) return; // Prevent overflow beyond page bottom

    rowValues.forEach((val, colIdx) => {
      page.drawText(String(val), {
        x: 35 + colIdx * colWidth,
        y: y - 10,
        size: 8,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
    });

    page.drawLine({
      start: { x: 30, y: y - 14 },
      end: { x: width - 30, y: y - 14 },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85),
    });

    y -= 18;
  });

  return await pdfDoc.save();
}
