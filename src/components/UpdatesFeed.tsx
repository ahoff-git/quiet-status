"use client";

import { useEffect, useMemo, useState } from "react";
import HighlightedText from "./HighlightedText";
import { KEY_TERMS } from "@/keyTerms";
import styles from "@/app/page.module.css";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type UpdateRow = {
  id: number;
  message: string;
  createdAt: string;
  displayName: string;
  color: string | null;
};

export default function UpdatesFeed({ refreshToken = 0 }: { refreshToken?: number }) {
  const [selectedUserId] = useLocalStorage<string>("selectedUserId", "");
  const [rows, setRows] = useState<UpdateRow[]>([]);

  const viewerId = useMemo(() => (selectedUserId ? Number(selectedUserId) : undefined), [selectedUserId]);

  useEffect(() => {
    const controller = new AbortController();
    const url = new URL("/api/updates", window.location.origin);
    if (viewerId) url.searchParams.set("viewerId", String(viewerId));
    fetch(url.toString(), { signal: controller.signal })
      .then((r) => r.json())
      .then((data: UpdateRow[]) => setRows(data))
      .catch(() => {});
    return () => controller.abort();
  }, [viewerId, refreshToken]);

  return (
    <ul className={styles.updates}>
      {rows.map((row) => (
        <li key={row.id} className={styles.updateItem}>
          <div className={styles.header}>
            <span className={styles.name} style={{ color: row.color || "inherit" }}>
              {row.displayName}
            </span>
            <span className={styles.time}>{new Date(row.createdAt).toLocaleString()}</span>
          </div>
          <p className={styles.message}>
            <HighlightedText text={row.message} terms={KEY_TERMS} />
          </p>
        </li>
      ))}
    </ul>
  );
}

