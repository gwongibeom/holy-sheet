import type { WorkBook, WorkSheet } from 'xlsx';
import xlsx from 'xlsx';
import type { SheetSchema, ValidationResult } from '../types';
import * as validators from './validators';

/**
 * Processes the workbook against the given schema and returns the validation result.
 * This is the core validation engine.
 */
export function processWorkbook<T>(workbook: WorkBook, schema: SheetSchema): ValidationResult<T> {
  const errors: string[] = [];
  const validatedData: T[] = [];

  // 1. Get the first sheet from the workbook.
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { errors: ['Workbook is empty.'], count: 0, data: [] };
  }
  const worksheet: WorkSheet = workbook.Sheets[sheetName];

  // 2. Convert sheet to JSON. `header: 1` keeps the first row as an array of strings.
  const headers: string[] = (xlsx.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[]) || [];
  const data: any[] = xlsx.utils.sheet_to_json(worksheet);

  if (data.length === 0) {
    return { errors: ['Sheet has no data.'], count: 0, data: [] };
  }

  // 3. Check if all REQUIRED schema-defined columns exist in the sheet.
  const schemaHeaders = Object.keys(schema);
  for (const schemaHeader of schemaHeaders) {
    const rule = schema[schemaHeader];
    if (rule.required && !headers.includes(schemaHeader)) {
      errors.push(`Column '${schemaHeader}' not found in the sheet.`);
    }
  }

  if (errors.length > 0) {
    return { errors, count: 0, data: [] };
  }

  // 4. Iterate over data rows and validate.
  data.forEach((row, rowIndex) => {
    let rowIsValid = true;

    for (const header of schemaHeaders) {
      // Skip validation for columns defined in schema but not present in the sheet.
      if (!headers.includes(header)) {
        continue;
      }

      const rule = schema[header];
      const value = row[header];
      const cellAddress = `${xlsx.utils.encode_col(headers.indexOf(header))}${rowIndex + 2}`;

      // Required check
      if (rule.required) {
        if (value === null || value === undefined || value === '') {
          errors.push(`Cell ${cellAddress}: Column '${header}' is required.`);
          rowIsValid = false;
          continue; // No need to check other rules if it's missing
        }
      }

      // Type check (only if value is not empty)
      if (rule.type && value) {
        let typeIsValid = false;
        switch (rule.type) {
          case 'uuid':
            typeIsValid = validators.isUUID(value);
            break;
          case 'string':
            typeIsValid = validators.isString(value);
            break;
          case 'number':
            typeIsValid = validators.isNumber(value);
            break;
          // Other types can be added here
          default:
            typeIsValid = true; // Or handle unknown types
        }
        if (!typeIsValid) {
          errors.push(`Cell ${cellAddress}: Value '${value}' is not a valid ${rule.type}.`);
          rowIsValid = false;
        }
      }

      // Custom validator check
      if (rule.validate && value) {
        for (const [message, validatorFn] of Object.entries(rule.validate)) {
          if (!validatorFn(value)) {
            errors.push(`Cell ${cellAddress}: ${message}`);
            rowIsValid = false;
          }
        }
      }
    }

    if (rowIsValid) {
      validatedData.push(row as T);
    }
  });

  return {
    errors,
    count: validatedData.length,
    data: validatedData,
  };
}