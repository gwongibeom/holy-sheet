import * as s from '../src';
import { createMockWorkbook } from './helper';

describe('holy-sheet validation', () => {
  // Define a standard schema for use in multiple tests
  const testSchema = s.schema({
    ID: s.column({ type: 'uuid', required: true }),
    Name: s.column({ type: 'string', required: true }),
    Age: s.column({ 
      type: 'number', 
      required: true, 
      validate: { 'Age must be 18 or over': (age) => age >= 18 }
    }),
    Email: s.column({ type: 'string', required: false }),
  });

  it('should validate a perfect sheet successfully', () => {
    const data = [
      ['ID', 'Name', 'Age', 'Email'],
      ['f47ac10b-58cc-4372-a567-0e02b2c3d479', 'John Doe', 30, 'john.doe@example.com'],
      ['f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Jane Doe', 25, ''],
    ];
    const workbook = createMockWorkbook(data);
    const { errors, count, data: validatedData } = testSchema.validate(workbook);

    expect(errors).toHaveLength(0);
    expect(count).toBe(2);
    expect(validatedData).toHaveLength(2);
    expect(validatedData[0].Name).toBe('John Doe');
  });

  it('should return an error if a required column is missing', () => {
    const data = [
      ['ID', 'Name'], // Age column is missing
      ['f47ac10b-58cc-4372-a567-0e02b2c3d479', 'John Doe'],
    ];
    const workbook = createMockWorkbook(data);
    const { errors, count } = testSchema.validate(workbook);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe("Column 'Age' not found in the sheet.");
    expect(count).toBe(0);
  });

  it('should return an error for a missing required value', () => {
    const data = [
      ['ID', 'Name', 'Age'],
      ['f47ac10b-58cc-4372-a567-0e02b2c3d479', '', 30], // Name is missing
    ];
    const workbook = createMockWorkbook(data);
    const { errors } = testSchema.validate(workbook);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("Cell B2: Column 'Name' is required.");
  });

  it('should return an error for an invalid type (UUID)', () => {
    const data = [
      ['ID', 'Name', 'Age'],
      ['invalid-uuid', 'John Doe', 30],
    ];
    const workbook = createMockWorkbook(data);
    const { errors } = testSchema.validate(workbook);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("Cell A2: Value 'invalid-uuid' is not a valid uuid.");
  });

  it('should return an error for a custom validation rule', () => {
    const data = [
      ['ID', 'Name', 'Age'],
      ['f47ac10b-58cc-4372-a567-0e02b2c3d479', 'John Doe', 17], // Age is less than 18
    ];
    const workbook = createMockWorkbook(data);
    const { errors } = testSchema.validate(workbook);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("Cell C2: Age must be 18 or over");
  });

  it('should only return valid data and filter out invalid rows', () => {
    const data = [
      ['ID', 'Name', 'Age', 'Email'],
      ['f47ac10b-58cc-4372-a567-0e02b2c3d479', 'John Doe', 30, 'john.doe@example.com'], // Valid
      ['f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Jane Doe', 17, ''], // Invalid age
      ['f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Sam Smith', 25, ''], // Valid
      ['invalid-uuid', 'Invalid Person', 40, ''], // Invalid ID
    ];
    const workbook = createMockWorkbook(data);
    const { errors, count, data: validatedData } = testSchema.validate(workbook);

    expect(errors).toHaveLength(2); // Two errors from the two invalid rows
    expect(count).toBe(2); // Two valid rows
    expect(validatedData).toHaveLength(2);
    expect(validatedData.map(d => d.Name)).toEqual(['John Doe', 'Sam Smith']);
  });
});
