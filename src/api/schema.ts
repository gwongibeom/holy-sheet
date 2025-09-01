import type { WorkBook } from 'xlsx';
import { processWorkbook } from '../core/processor';
import type { SheetSchema, ValidationResult } from '../types';

/**
 * Creates a schema object that can be used to validate a workbook.
 * @param schemaDefinition The object defining the validation rules for each column.
 */
export function schema<T extends SheetSchema>(schemaDefinition: T) {
  return {
    /**
     * Validates a workbook against the predefined schema.
     * @param workbook The workbook object from a library like 'xlsx'.
     */
    validate: (workbook: WorkBook): ValidationResult<any> => {
      return processWorkbook(workbook, schemaDefinition);
    },
  };
}
