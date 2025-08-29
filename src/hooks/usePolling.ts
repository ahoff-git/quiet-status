"use client";

import { useEffect, type DependencyList } from "react";

// Repeatedly invoke a callback on a fixed interval.
// Runs once immediately and again every `intervalMs` milliseconds.
// Dependencies can be supplied to reset the interval when inputs change.
export function usePolling(
  callback: () => void,
  intervalMs: number,
  deps: DependencyList = []
) {
  useEffect(() => {
    const id = window.setInterval(callback, intervalMs);
    callback();
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, intervalMs, ...deps]);
}
