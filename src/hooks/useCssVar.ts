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
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => read();
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else if ((mql as any).addListener) (mql as any).addListener(onChange);

    // Fallback timer in case vars change through other means
    const interval = window.setInterval(read, 2000);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else if ((mql as any).removeListener) (mql as any).removeListener(onChange);
      window.clearInterval(interval);
    };
  }, [varName]);

  return value;
}

