# Holy-Sheet Usage Guide

`holy-sheet` is a library that helps you easily validate data from Excel or other sheet files.

## Installation

```bash
pnpm add @gwongibeom/holy-sheet
```

## Basic Usage

First, you need to create a "schema" that defines the validation rules. Then, use that schema to validate a `WorkBook` object read from a library like `xlsx`.

```typescript
import * as s from '@gwongibeom/holy-sheet';
import type { WorkBook } from 'xlsx';

// 1. Define the schema for the sheet you want to validate.
const userSheetSchema = s.schema({
  // The keys correspond to the header names in the Excel sheet.
  'ID': s.column({ 
    type: 'uuid', 
    required: true 
  }),
  'Name': s.column({
    type: 'string',
  }), // If `required` is omitted, it defaults to true.
  'Age': s.column({
    type: 'number',
    validate: {
      'Age must be 18 or over': (value) => value >= 18,
    }
  }),
  'Email': s.column({
    type: 'string',
    required: false, // `required: false` marks the column as optional.
  })
});

// 2. Use the defined schema to validate a workbook.
declare const workbook: WorkBook;
const { errors, count, data } = userSheetSchema.validate(workbook);

// 3. Check the results
if (errors.length > 0) {
  console.error('Validation Errors:', errors);
  // Example error: ["Cell C2: 'Age must be 18 or over'"]
} else {
  console.log(`Successfully validated ${count} rows.`);
  console.log('Validated Data:', data);
}
```

### Return Value

The `validate` function returns an object with the following properties:

- `errors`: An array of all error messages encountered during validation. It is an empty array if there are no errors.
- `count`: The total number of data rows that were successfully validated.
- `data`: An array of the data rows that passed validation.
