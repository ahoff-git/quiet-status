"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import HighlightedText from "./HighlightedText";
import { KEY_TERMS } from "@/keyTerms";
import styles from "@/app/page.module.css";
import { useSelectedUser } from "@/state/SelectedUserContext";
import { useCssVar } from "@/hooks/useCssVar";
import { isLowContrast, contrastRatio } from "@/utils/color";

type UpdateRow = {
  id: number;
  message: string;
  createdAt: string;
  displayName: string;
  color: string | null;
};

export default function UpdatesFeed({ refreshToken = 0 }: { refreshToken?: number }) {
  const { selectedUserId } = useSelectedUser();
  const [rows, setRows] = useState<UpdateRow[]>([]);

  const viewerId = useMemo(() => (selectedUserId ? Number(selectedUserId) : undefined), [selectedUserId]);
  const background = useCssVar("--background");
  const foreground = useCssVar("--foreground");

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
            {(() => {
              const userColor = row.color || undefined;
              const low = userColor && background ? isLowContrast(userColor, background, 3) : false;
              const nameClass = low ? `${styles.name} ${styles.nameLowContrast}` : styles.name;
              let style: CSSProperties = { color: userColor || "inherit" };
              if (low && userColor) {
                // Choose a chip background that best contrasts the user's color
                const fg = foreground;
                const bg = background;
                let chip = fg || bg || undefined;
                if (fg && bg) {
                  const rFg = contrastRatio(userColor, fg) ?? 0;
                  const rBg = contrastRatio(userColor, bg) ?? 0;
                  chip = rFg >= rBg ? fg : bg;
                }
                if (chip) {
                  style = { color: userColor, backgroundColor: chip, borderColor: chip };
                } else {
                  style = { color: userColor };
                }
              }

              return (
                <span className={nameClass} style={style}>
                  {row.displayName}
                </span>
              );
            })()}
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
