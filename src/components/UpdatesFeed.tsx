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
  userId: number;
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
  // Editing state
  const [editing, setEditing] = useState<{
    id: number;
    message: string;
    expiresAtLocal: string;
    reachAll: boolean;
    reachSelected: number[];
    optionsOpen: boolean;
    ownerId?: number;
  } | null>(null);

  function formatForDateTimeLocal(d: Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const beginEdit = async (row: UpdateRow) => {
    if (!viewerId) return;
    try {
      const res = await fetch(`/api/updates/${row.id}?viewerId=${viewerId}`);
      if (!res.ok) return;
      const detail: { message: string; expiresAt: string | null; reach: number[] | null; userId: number } = await res.json();
      const expiresAtLocal = detail.expiresAt ? formatForDateTimeLocal(new Date(detail.expiresAt)) : formatForDateTimeLocal(new Date());
      const reachAll = !detail.reach || detail.reach.length === 0;
      const ownerId = row.userId;
      const reachSelected = reachAll ? [ownerId] : Array.from(new Set([ownerId, ...detail.reach!]));
      setEditing({ id: row.id, message: detail.message, expiresAtLocal, reachAll, reachSelected, optionsOpen: false, ownerId });
    } catch {}
  };

  const saveEdit = async () => {
    if (!editing || !viewerId) return;
    const { id, message, expiresAtLocal, reachAll, reachSelected } = editing;
    let expiresAtIso: string | null = null;
    if (expiresAtLocal) {
      const parsed = new Date(expiresAtLocal);
      if (!Number.isNaN(parsed.getTime())) expiresAtIso = parsed.toISOString();
    }
    const body = {
      userId: viewerId,
      message: message.trim(),
      expiresAt: expiresAtIso,
      reachUserIds: reachAll ? null : reachSelected,
    };
    const res = await fetch(`/api/updates/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) {
      setEditing(null);
      fetchUpdates();
    }
  };

  const deleteUpdate = async (row: UpdateRow) => {
    if (!viewerId) return;
    if (!confirm('Delete this post?')) return;
    const res = await fetch(`/api/updates/${row.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: viewerId }) });
    if (res.ok) {
      if (editing && editing.id === row.id) setEditing(null);
      fetchUpdates();
    }
  };

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
      u.color ? [{ terms: [u.displayName], color: u.color }] : []
    );
    return [...KEY_TERMS, ...userTerms];
  }, [users]);

  return (
    <>
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
                  {est ? ` | ${est}` : ""}
                  {(viewerId === row.userId || viewerId === 1) && (
                    <>
                      {" | "}
                      <button className={styles.inlineAction} onClick={() => beginEdit(row)} title="Edit">&#9998;</button>
                      {" | "}
                      <button className={styles.inlineAction} onClick={() => deleteUpdate(row)} title="Delete">&#10006;</button>
                    </>
                  )}
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
      {editing && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 60, padding: 12, background: "var(--background)", borderTop: "1px solid #eaeaea" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              className={styles.input}
              placeholder="Edit message..."
              value={editing.message}
              onChange={(e) => setEditing({ ...editing, message: e.target.value })}
            />
            <button className={styles.postOptionsButton} onClick={() => setEditing({ ...editing, optionsOpen: !editing.optionsOpen })}>
              Options
            </button>
            <button className={styles.postButton} disabled={!editing.message.trim()} onClick={saveEdit}>Save</button>
            <button className={styles.postOptionsButton} onClick={() => setEditing(null)}>Cancel</button>
          </div>
          {editing.optionsOpen && (
            <div className={styles.postOptionsPanel} style={{ bottom: 120 }}>
              <div className={styles.optionRow}>
                <label className={styles.optionLabel}>Reach:</label>
                <div className={styles.reachChoices}>
                  <label>
                    <input type="radio" name="reach" checked={editing.reachAll} onChange={() => setEditing({ ...editing, reachAll: true })} />
                    Everyone
                  </label>
                  <label>
                    <input type="radio" name="reach" checked={!editing.reachAll} onChange={() => setEditing({ ...editing, reachAll: false })} />
                    Selected
                  </label>
                </div>
              </div>
              {!editing.reachAll && (
                <div className={styles.reachList}>
                  {users.map((u) => (
                    <label key={u.id} className={styles.reachItem}>
                      <input
                        type="checkbox"
                        checked={editing.reachSelected.includes(u.id)}
                        disabled={u.id === editing.ownerId}
                        onChange={() => {
                          if (u.id === editing.ownerId) return;
                          const included = editing.reachSelected.includes(u.id);
                          const next = included ? editing.reachSelected.filter((x) => x !== u.id) : [...editing.reachSelected, u.id];
                          setEditing({ ...editing, reachSelected: next });
                        }}
                      />
                      {u.displayName}
                    </label>
                  ))}
                </div>
              )}
              <div className={styles.optionRow}>
                <label className={styles.optionLabel}>Est. end time:</label>
                <input type="datetime-local" value={editing.expiresAtLocal} min={formatForDateTimeLocal(new Date())} onChange={(e) => setEditing({ ...editing, expiresAtLocal: e.target.value })} />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}