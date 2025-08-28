"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/app/page.module.css";
import { useSelectedUser } from "@/state/SelectedUserContext";
import type { UserOption } from "./UserSelector";

function formatForDateTimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDiffDHMS(now: Date, future: Date): string {
  const ms = Math.max(0, future.getTime() - now.getTime());
  let totalMinutes = Math.round(ms / 60000);
  let days = Math.floor(totalMinutes / (60 * 24));
  totalMinutes -= days * 60 * 24;
  let hours = Math.floor(totalMinutes / 60);
  totalMinutes -= hours * 60;
  let minutes = totalMinutes;
  // Normalize rounding edge cases
  if (minutes === 60) {
    minutes = 0;
    hours += 1;
  }
  if (hours === 24) {
    hours = 0;
    days += 1;
  }
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
}

export default function PostBar({ users, onPosted }: { users: UserOption[]; onPosted?: () => void }) {
  const { selectedUserId } = useSelectedUser();
  const posterId = useMemo(() => (selectedUserId ? Number(selectedUserId) : undefined), [selectedUserId]);

  const [message, setMessage] = useState("");
  // default estimated end time is now + 24h
  const [expiresAtLocal, setExpiresAtLocal] = useState<string>(() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return formatForDateTimeLocal(d);
  });
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [reachAll, setReachAll] = useState(true);
  const [reachSelected, setReachSelected] = useState<number[]>([]);
  const [nowTick, setNowTick] = useState<number>(Date.now());
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  // Ensure the poster is always included when selecting specific users
  useEffect(() => {
    if (!posterId) return;
    if (!reachAll) {
      setReachSelected((prev) =>
        prev.includes(posterId) ? prev : [...prev, posterId]
      );
    }
  }, [posterId, reachAll]);

  const canPost = posterId && message.trim().length > 0;

  const toggleReach = (id: number) => {
    // Do not allow unchecking your own name
    if (posterId && id === posterId) return;
    setReachSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  async function submit() {
    if (!canPost) return;
    let expiresAtIso: string | undefined;
    if (expiresAtLocal) {
      const parsed = new Date(expiresAtLocal);
      if (!Number.isNaN(parsed.getTime())) {
        expiresAtIso = parsed.toISOString();
      }
    }
    const body = {
      userId: posterId,
      message: message.trim(),
      expiresAt: expiresAtIso,
      reachUserIds: reachAll ? null : reachSelected,
    };
    await fetch("/api/updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setMessage("");
    if (onPosted) onPosted();
  }

  // Update displayed diff periodically
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.bottomBar}>
      <input
        className={styles.input}
        placeholder="Share an update..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button className={styles.postOptionsButton} onClick={() => setOptionsOpen((v) => !v)}>
        Options
      </button>
      {optionsOpen && (
        <div className={styles.postOptionsPanel}>
          <div className={styles.optionRow}>
            <label className={styles.optionLabel}>Reach:</label>
            <div className={styles.reachChoices}>
              <label>
                <input
                  type="radio"
                  name="reach"
                  checked={reachAll}
                  onChange={() => setReachAll(true)}
                />
                Everyone
              </label>
              <label>
                <input
                  type="radio"
                  name="reach"
                  checked={!reachAll}
                  onChange={() => setReachAll(false)}
                />
                Selected
              </label>
            </div>
          </div>
          {!reachAll && (
            <div className={styles.reachList}>
              {users.map((u) => (
                <label key={u.id} className={styles.reachItem}>
                  <input
                    type="checkbox"
                    checked={u.id === posterId || reachSelected.includes(u.id)}
                    disabled={u.id === posterId}
                    onChange={() => toggleReach(u.id)}
                  />
                  {u.displayName}
                </label>
              ))}
            </div>
          )}
          <div className={styles.optionRow}>
            <label className={styles.optionLabel}>Est. end time:</label>
            <button
              type="button"
              className={styles.postOptionsButton}
              onClick={() => {
                const el = dateInputRef.current;
                if (!el) return;
                try {
                  // Prefer showPicker when available
                  const picker = el as HTMLInputElement & { showPicker?: () => void };
                  if (typeof picker.showPicker === "function") {
                    picker.showPicker();
                  } else {
                    el.focus();
                    el.click();
                  }
                } catch {
                  el.focus();
                  el.click();
                }
              }}
            >
              {(() => {
                const now = new Date(nowTick);
                const sel = new Date(expiresAtLocal);
                if (Number.isNaN(sel.getTime())) return "Set time";
                return formatDiffDHMS(now, sel);
              })()}
            </button>
            <button
              type="button"
              className={styles.postOptionsButton}
              onClick={() => setExpiresAtLocal(formatForDateTimeLocal(new Date()))}
              title="Set to today (now)"
            >
              Today
            </button>
            <input
              ref={dateInputRef}
              type="datetime-local"
              value={expiresAtLocal}
              min={formatForDateTimeLocal(new Date())}
              onChange={(e) => setExpiresAtLocal(e.target.value)}
              style={{ position: "absolute", right: 0, bottom: 0, width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
              aria-hidden
              tabIndex={-1}
            />
          </div>
        </div>
      )}
      <button className={styles.postButton} disabled={!canPost} onClick={submit}>
        Post
      </button>
    </div>
  );
}
