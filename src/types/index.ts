/**
 * Defines the validation rules for a single column.
 */
export type Column<T = any> = {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'uuid';
  validate?: Record<string, (value: T) => boolean>;
};

/**
 * Represents the entire sheet schema, mapping column headers to their rules.
 */
export type SheetSchema = Record<string, Column>;

/**
 * The result of a validation run.
 */
export type ValidationResult<T> = {
  errors: string[];
  count: number;
  data: T[];
};
