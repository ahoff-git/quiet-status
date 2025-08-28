'use client';

import { useEffect, useRef, useState } from 'react';
import type { UpdateRecord } from '../db/queries';
import styles from './page.module.css';

interface Props {
  initialUpdates: UpdateRecord[];
}

export default function UpdatesFeed({ initialUpdates }: Props) {
  const [updates, setUpdates] = useState<UpdateRecord[]>(initialUpdates);
  const [message, setMessage] = useState('');
  const lastTime = useRef<Date>(
    initialUpdates[0] ? new Date(initialUpdates[0].createdAt) : new Date(0),
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      const since = lastTime.current.toISOString();
      const res = await fetch(`/api/updates?since=${encodeURIComponent(since)}`);
      if (res.ok) {
        const data: UpdateRecord[] = await res.json();
        if (data.length > 0) {
          lastTime.current = new Date(data[0].createdAt);
          setUpdates((prev) => [...data, ...prev]);
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  async function handlePost() {
    const text = message.trim();
    if (!text) return;
    const res = await fetch('/api/updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, userId: 1 }),
    });
    if (res.ok) {
      const row: UpdateRecord = await res.json();
      lastTime.current = new Date(row.createdAt);
      setUpdates((prev) => [row, ...prev]);
      setMessage('');
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button>Filters</button>
        <button>Settings</button>
      </div>
      <ul className={styles.updates}>
        {updates.map((row) => (
          <li key={row.id} className={styles.updateItem}>
            <div className={styles.header}>
              <span
                className={styles.name}
                style={{ color: row.color || 'inherit' }}
              >
                {row.displayName}
              </span>
              <span className={styles.time}>
                {new Date(row.createdAt).toLocaleString()}
              </span>
            </div>
            <p className={styles.message}>{row.message}</p>
          </li>
        ))}
      </ul>
      <div className={styles.bottomBar}>
        <input
          className={styles.input}
          placeholder="Share an update..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className={styles.postButton} onClick={handlePost}>
          Post
        </button>
      </div>
    </div>
  );
}
