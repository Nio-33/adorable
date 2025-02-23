// Type guards for null and undefined checks
export const isNonNullable = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

// Type conversion utilities
export const convertNullToUndefined = <T>(value: T | null): T | undefined => {
  return value === null ? undefined : value;
};

// Type transformers
export type NullToUndefined<T> = T extends null ? undefined : T;
export type RecursiveNullToUndefined<T> = {
  [P in keyof T]: T[P] extends (infer U)[]
    ? RecursiveNullToUndefined<U>[]
    : T[P] extends object
    ? RecursiveNullToUndefined<T[P]>
    : NullToUndefined<T[P]>;
};

// Data transformer function
export const transformData = <T extends Record<string, any>>(data: T): RecursiveNullToUndefined<T> => {
  if (!data || typeof data !== 'object') {
    return data as RecursiveNullToUndefined<T>;
  }

  if (Array.isArray(data)) {
    return data.map((item) => 
      item && typeof item === 'object' ? transformData(item as Record<string, any>) : item
    ) as RecursiveNullToUndefined<T>;
  }

  const transformed = { ...data } as { [K in keyof T]: any };
  
  for (const key in transformed) {
    const value = transformed[key];
    if (value === null) {
      transformed[key] = undefined;
    } else if (value && typeof value === 'object') {
      transformed[key] = transformData(value as Record<string, any>);
    }
  }
  
  return transformed as RecursiveNullToUndefined<T>;
}; 