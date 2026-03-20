"use client";

import { useCallback, useEffect, useState } from "react";

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(key);
    if (stored === null) {
      setIsLoaded(true);
      return;
    }

    const parsed = safeJsonParse<T>(stored);
    if (parsed !== null) {
      setValue(parsed);
    }
    setIsLoaded(true);
  }, [key]);

  const setAndPersist = useCallback(
    (next: React.SetStateAction<T>) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        window.localStorage.setItem(key, JSON.stringify(resolved));
        return resolved;
      });
    },
    [key]
  );

  return { value, setValue: setAndPersist, isLoaded };
}

