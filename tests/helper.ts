import xlsx from 'xlsx';
import type { WorkBook } from 'xlsx';

/**
 * Creates a mock workbook object from a 2D array of data.
 * The first inner array is treated as the header row.
 * @param data The 2D array representing the sheet data.
 * @param sheetName The name of the sheet.
 * @returns A mock workbook object.
 */
export function createMockWorkbook(data: any[][], sheetName = 'Sheet1'): WorkBook {
  const worksheet = xlsx.utils.aoa_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
  return workbook;
}
