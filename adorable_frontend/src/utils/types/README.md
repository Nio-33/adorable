# Type System Documentation

## Overview

Our application uses TypeScript with strict type checking enabled. We have implemented a robust type system that handles null safety and type conversions, particularly focusing on the conversion between `null` and `undefined` values.

## Type Utilities

### `isNonNullable<T>`

A type guard that checks if a value is neither null nor undefined.

```typescript
const isNonNullable = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};
```

### `convertNullToUndefined<T>`

Converts null values to undefined while preserving non-null values.

```typescript
const convertNullToUndefined = <T>(value: T | null): T | undefined => {
  return value === null ? undefined : value;
};
```

### Type Transformers

#### `NullToUndefined<T>`

A type utility that converts null types to undefined:

```typescript
type NullToUndefined<T> = T extends null ? undefined : T;
```

#### `RecursiveNullToUndefined<T>`

Recursively converts all null types to undefined in nested objects and arrays:

```typescript
type RecursiveNullToUndefined<T> = {
  [P in keyof T]: T[P] extends (infer U)[]
    ? RecursiveNullToUndefined<U>[]
    : T[P] extends object
    ? RecursiveNullToUndefined<T[P]>
    : NullToUndefined<T[P]>;
};
```

### Data Transformer

#### `transformData<T>`

A utility function that recursively transforms null values to undefined in objects:

```typescript
const transformData = <T extends Record<string, any>>(data: T): RecursiveNullToUndefined<T>;
```

## Type Safety Best Practices

1. **API Responses**: Use `transformData` when handling API responses to ensure consistent type safety:
   ```typescript
   const response = await apiService.get<Place>('/places/1');
   const safePlace = transformData(response.data);
   ```

2. **Optional Properties**: Prefer `undefined` over `null` for optional properties:
   ```typescript
   interface User {
     id: string;
     email: string;
     bio?: string; // Use undefined instead of null
   }
   ```

3. **Type Guards**: Use type guards to handle nullable values:
   ```typescript
   if (isNonNullable(user.bio)) {
     // bio is guaranteed to be string here
   }
   ```

## Error Boundaries

We use React Error Boundaries to catch and handle runtime type errors gracefully:

```typescript
// Wrap components that might throw type-related errors
<ErrorBoundary>
  <ComponentWithPotentialTypeErrors />
</ErrorBoundary>
```

## TypeScript Configuration

Our `tsconfig.json` is configured with strict type checking:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    // ... other strict options
  }
}
```

## Common Type Patterns

### Component Props

```typescript
interface ComponentProps {
  required: string;
  optional?: string;
  nullable: string | null;
  children: React.ReactNode;
}
```

### API Response Types

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
```

### Error Types

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
``` 