"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface FontSizeCtx {
  fontSize: number;
  setFontSize: (size: number) => void;
}

const FontSizeContext = createContext<FontSizeCtx | undefined>(undefined);

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useLocalStorage<number>("fontSize", 16);

  useEffect(() => {
    document.documentElement.style.setProperty("--post-font-size", `${fontSize}px`);
  }, [fontSize]);

  const value = useMemo<FontSizeCtx>(() => ({ fontSize, setFontSize }), [fontSize, setFontSize]);

  return <FontSizeContext.Provider value={value}>{children}</FontSizeContext.Provider>;
}

export function useFontSize() {
  const ctx = useContext(FontSizeContext);
  if (!ctx) throw new Error("useFontSize must be used within FontSizeProvider");
  return ctx;
}
