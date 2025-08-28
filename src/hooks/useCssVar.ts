"use client";

import { useEffect, useState } from "react";

export function useCssVar(varName: string): string {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    const read = () => {
      try {
        const v = getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim();
        if (v) setValue(v);
      } catch {
        // no-op
      }
    };

    read();

    // Update on theme changes (prefers-color-scheme) since our vars depend on it
    type MqlLegacy = MediaQueryList & {
      addListener?: (this: MediaQueryList, listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
      removeListener?: (this: MediaQueryList, listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
    };
    const mql = window.matchMedia("(prefers-color-scheme: dark)") as MqlLegacy;
    const onChange = () => read();
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else if (mql.addListener) mql.addListener(onChange as unknown as (this: MediaQueryList, ev: MediaQueryListEvent) => void);

    // Fallback timer in case vars change through other means
    const interval = window.setInterval(read, 2000);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else if (mql.removeListener) mql.removeListener(onChange as unknown as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
      window.clearInterval(interval);
    };
  }, [varName]);

  return value;
}
