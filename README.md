# holy-sheet
Easy and simple validation library for sheet file

# Why I Made this
Before I made holy-sheet my team usually run validation logic sheet file by nested loops like this.
```typescript
import type { WorkBook, WorkSheet } from 'xlsx';
import xlsx from 'xlsx';

export function validateSheetData(workbook: WorkBook): { errors?: string[]; count?: number } {
  const sheetKey = workbook.SheetNames[0];
  const workSheet: WorkSheet = workbook.Sheets[sheetKey];

  const COLUMN = {
    ID: 0,
    NAME: 1,
    YEAR: 2,
  } as const;

  if (workSheet?.['!ref'] === undefined) {
    return { errors: ['Invalid worksheet'] };
  }

  if (!workSheet?.['!ref'].includes(':')) {
    return { errors: ['No records found'] };
  }

  const coords = workSheet['!ref'].split(':');
  const { r: firstRow, c: firstCol } = xlsx.utils.decode_cell(coords[0]);
  const { r: lastRow, c: lastCol } = xlsx.utils.decode_cell(coords[1]);

  const errors: string[] = [];
  let isNull = false;

  for (let i = firstRow + 1; i <= lastRow; i++) {
    if (isNull) break;
    for (let j = firstCol; j <= lastCol; j++) {
      const cell = { c: j, r: i };
      const cellAddress = xlsx.utils.encode_cell(cell);

      if (workSheet[cellAddress] === undefined) {
        if (j === COLUMN.YEAR) {
          errors.push(`Cell ${cellAddress} is required.`);
        }
        isNull = true;
        break;
      }

      const value = workSheet[cellAddress]?.v;

      if (j === COLUMN.ID && typeof value === 'string' && !/^[0-9a-fA-F-]{36}$/.test(value)) {
        errors.push(`Cell ${cellAddress} is not a valid UUID.`);
      }

      if (j === COLUMN.YEAR && (value === undefined || value === null || value === '')) {
        errors.push(`Cell ${cellAddress} is required.`);
      }
    }
  }

  let count = 0;
  for (let y = firstRow + 1; y <= lastRow; y++, count++) {
    const cell = xlsx.utils.encode_cell({ r: y, c: 0 });
    if (!(workSheet[cell] && workSheet[cell].v)) {
      break;
    }
  }

  if (errors.length !== 0) {
    return { errors: count === 0 ? ["No data in sheet"] : errors };
  }

  return { count };
}
```

If functions like that exist only one OR two? It will be fine. Just let them survive.
But my environment? It was not. My team is working on the admin of a VERY BIG service with millions of users.
In our admin web page, there are SO MANY data upsert logic functions with sheet files and we need to validate almost every file.
We even have a B2B web also, so probably total sheet validation functions exist over 40.

Validation logic like this example usually doesn't need many edits, but nested loops are quite hard to understand quickly.
Hard-to-understand code means reading programmers are taking time on shit like this validation logic, making programmers tired faster and wanting to go home. (Actually I want to go home every time)