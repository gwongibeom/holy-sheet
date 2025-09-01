# Holy-Sheet 사용 가이드

`holy-sheet`는 엑셀이나 시트 파일의 데이터를 손쉽게 검증할 수 있도록 도와주는 라이브러리입니다.

## 설치

```bash
pnpm add @gwongibeom/holy-sheet
```

## 기본 사용법

먼저, 검증 규칙을 정의하는 "스키마"를 생성해야 합니다. 그 다음, 해당 스키마를 사용하여 `xlsx`와 같은 라이브러리에서 읽어온 `WorkBook` 객체를 검증합니다.

```typescript
import * as s from '@gwongibeom/holy-sheet';
import type { WorkBook } from 'xlsx';

// 1. 검증할 시트의 스키마를 정의합니다.
const userSheetSchema = s.schema({
  // key는 엑셀 시트의 헤더(열 이름)가 됩니다.
  'ID': s.column({ 
    type: 'uuid', 
    required: true 
  }),
  'Name': s.column({
    type: 'string',
  }), // required를 생략하면 기본값으로 true가 됩니다.
  'Age': s.column({
    type: 'number',
    validate: {
      '나이는 18세 이상이어야 합니다.': (value) => value >= 18,
    }
  }),
  'Email': s.column({
    type: 'string',
    required: false, // required: false는 선택적 열을 의미합니다.
  })
});

// 2. 정의한 스키마를 사용해 workbook을 검증합니다.
declare const workbook: WorkBook;
const { errors, count, data } = userSheetSchema.validate(workbook);

// 3. 결과 확인
if (errors.length > 0) {
  console.error('검증 오류:', errors);
  // 예시 오류: ["Cell C2: '나이는 18세 이상이어야 합니다.'"]
} else {
  console.log(`총 ${count}개의 행이 성공적으로 검증되었습니다.`);
  console.log('검증된 데이터:', data);
}
```

### 반환 값

`validate` 함수는 다음 속성을 가진 객체를 반환합니다.

- `errors`: 검증 과정에서 발생한 모든 오류 메시지 배열입니다. 오류가 없으면 빈 배열입니다.
- `count`: 성공적으로 검증된 데이터 행의 총 개수입니다.
- `data`: 검증을 통과한 데이터 행들의 배열입니다.
