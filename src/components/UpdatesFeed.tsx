"use client";

import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import HighlightedText from "./HighlightedText";
import { KEY_TERMS, type HighlightTerm } from "@/keyTerms";
import type { UserOption } from "./UserSelector";
import styles from "@/app/page.module.css";
import { useSelectedUser } from "@/state/SelectedUserContext";
import { useCssVar } from "@/hooks/useCssVar";
import { usePolling } from "@/hooks/usePolling";
import { isLowContrast, contrastRatio } from "@/utils/color";

type UpdateRow = {
  id: number;
  message: string;
  createdAt: string;
  expiresAt: string | null;
  displayName: string;
  color: string | null;
};

export default function UpdatesFeed({
  refreshToken = 0,
  pollInterval = 30000,
  users = [],
}: {
  refreshToken?: number;
  pollInterval?: number;
  users?: UserOption[];
}) {
  const { selectedUserId } = useSelectedUser();
  const [rows, setRows] = useState<UpdateRow[]>([]);

  const viewerId = useMemo(
    () => (selectedUserId ? Number(selectedUserId) : undefined),
    [selectedUserId]
  );
  const background = useCssVar("--background");
  const foreground = useCssVar("--foreground");

  const fetchUpdates = useCallback(() => {
    const url = new URL("/api/updates", window.location.origin);
    if (viewerId) url.searchParams.set("viewerId", String(viewerId));
    fetch(url.toString())
      .then((r) => r.json())
      .then((data: UpdateRow[]) => setRows(data))
      .catch(() => {});
  }, [viewerId]);

  usePolling(fetchUpdates, pollInterval, [refreshToken]);

  const terms = useMemo<HighlightTerm[]>(() => {
    const userTerms = users.flatMap((u) =>
      u.color ? [{ term: u.displayName, color: u.color }] : []
    );
    return [...KEY_TERMS, ...userTerms];
  }, [users]);

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
            {(() => {
              const created = new Date(row.createdAt);
              let est: string | null = null;
              if (row.expiresAt) {
                const expires = new Date(row.expiresAt);
                const ms = expires.getTime() - created.getTime();
                if (ms > 0) {
                  const mins = Math.round(ms / 60000);
                  if (mins < 60) {
                    est = `~${mins}m`;
                  } else if (mins < 60 * 24) {
                    est = `~${Math.round(mins / 60)}h`;
                  } else {
                    est = `~${Math.round(mins / (60 * 24))}d`;
                  }
                }
              }
              return (
                <span className={styles.time}>
                  {created.toLocaleString()}
                  {est ? ` • ${est}` : ""}
                </span>
              );
            })()}
          </div>
          <p className={styles.message}>
            <HighlightedText text={row.message} terms={terms} />
          </p>
        </li>
      ))}
    </ul>
  );
}
