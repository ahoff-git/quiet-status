"use client";

import { useMemo, useState } from "react";
import styles from "@/app/page.module.css";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { UserOption } from "./UserSelector";

const PRESET_DURATIONS: { label: string; minutes: number }[] = [
  { label: "1h", minutes: 60 },
  { label: "4h", minutes: 240 },
  { label: "8h", minutes: 480 },
  { label: "24h", minutes: 1440 },
  { label: "3d", minutes: 4320 },
  { label: "7d", minutes: 10080 },
];

export default function PostBar({ users, onPosted }: { users: UserOption[]; onPosted?: () => void }) {
  const [selectedUserId] = useLocalStorage<string>("selectedUserId", "");
  const posterId = useMemo(() => (selectedUserId ? Number(selectedUserId) : undefined), [selectedUserId]);

  const [message, setMessage] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(1440); // default 24h
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [reachAll, setReachAll] = useState(true);
  const [reachSelected, setReachSelected] = useState<number[]>([]);

  const canPost = posterId && message.trim().length > 0;

  const toggleReach = (id: number) => {
    setReachSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  async function submit() {
    if (!canPost) return;
    const body = {
      userId: posterId,
      message: message.trim(),
      durationMinutes,
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
                    checked={reachSelected.includes(u.id)}
                    onChange={() => toggleReach(u.id)}
                  />
                  {u.displayName}
                </label>
              ))}
            </div>
          )}
          <div className={styles.optionRow}>
            <label className={styles.optionLabel}>Duration:</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            >
              {PRESET_DURATIONS.map((d) => (
                <option key={d.minutes} value={d.minutes}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <button className={styles.postButton} disabled={!canPost} onClick={submit}>
        Post
      </button>
    </div>
  );
}

