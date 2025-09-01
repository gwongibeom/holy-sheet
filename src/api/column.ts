import type { Column } from '../types';

/**
 * Defines the validation rules for a column.
 * This is a helper function to provide type inference and structure.
 * By default, columns are considered required.
 * 
 * @param rules The validation rules for the column.
 */
export function column<T = any>(rules: Column<T>): Column<T> {
  return {
    required: true, // Set required to true by default
    ...rules,
  };
}
