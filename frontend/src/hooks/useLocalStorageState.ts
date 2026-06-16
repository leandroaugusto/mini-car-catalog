import { Dispatch, SetStateAction, useEffect, useState } from 'react';

interface UseLocalStorageStateOptions<T> {
  isValid?: (value: unknown) => value is T;
}

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  options?: UseLocalStorageStateOptions<T>
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);

      if (storedValue === null) {
        return defaultValue;
      }

      const parsedValue: unknown = JSON.parse(storedValue);

      if (options?.isValid && !options.isValid(parsedValue)) {
        return defaultValue;
      }

      return parsedValue as T;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
