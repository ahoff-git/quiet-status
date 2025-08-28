"use client";

import { useEffect, useState } from "react";

// A small, component-safe wrapper around localStorage
// - Initializes from storage on mount
// - Syncs across components by listening to both the native 'storage' event
//   (cross-document) and a custom 'local-storage' event (same document)
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  const readFromStorage = () => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setValue(JSON.parse(item));
      } else {
        setValue(initialValue);
      }
    } catch {
      // ignore read errors
    }
  };

  useEffect(() => {
    // Initialize from storage
    readFromStorage();

    // Sync when other tabs change storage
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === key) readFromStorage();
    };

    // Sync within the same document (when our setter runs elsewhere)
    const onLocal = (e: Event) => {
      try {
        const ce = e as CustomEvent<{ key: string }>;
        if (!ce.detail || ce.detail.key === key) readFromStorage();
      } catch {
        // ignore parsing errors
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("local-storage", onLocal as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("local-storage", onLocal as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    try {
      window.localStorage.setItem(key, JSON.stringify(newValue));
      // Notify other hooks in the same document
      window.dispatchEvent(
        new CustomEvent("local-storage", { detail: { key } })
      );
    } catch {
      // ignore write errors
    }
  };

  return [value, setStoredValue] as const;
}
