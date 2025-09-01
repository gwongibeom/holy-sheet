/**
 * Checks if a value is a valid UUID.
 * @param value The value to check.
 */
export function isUUID(value: any): boolean {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(value);
}

/**
 * Checks if a value is a string.
 * @param value The value to check.
 */
export function isString(value: any): boolean {
  return typeof value === 'string';
}

/**
 * Checks if a value is a number.
 * @param value The value to check.
 */
export function isNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value);
}