import { getDb } from "../db";
import { updates, users, userSettings } from "../db/schema";
import { desc, eq, gt } from "drizzle-orm";
import UserSelector, { type UserOption } from "../components/UserSelector";
import HighlightedText from "../components/HighlightedText";
import { KEY_TERMS } from "../keyTerms";
import SettingsButton from "../components/SettingsButton";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const db = await getDb();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      id: updates.id,
      message: updates.message,
      createdAt: updates.createdAt,
      displayName: users.displayName,
      color: userSettings.color,
    })
    .from(updates)
    .innerJoin(users, eq(users.id, updates.userId))
    .leftJoin(userSettings, eq(users.id, userSettings.userId))
    .where(gt(updates.createdAt, since))
    .orderBy(desc(updates.createdAt));

  const userOptions: UserOption[] = await db
    .select({ id: users.id, displayName: users.displayName })
    .from(users);

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <UserSelector users={userOptions} />
        <div className={styles.topBarButtons}>
          <button>Filters</button>
          <SettingsButton />
        </div>
      </div>
      <ul className={styles.updates}>
        {rows.map((row) => (
          <li key={row.id} className={styles.updateItem}>
            <div className={styles.header}>
              <span
                className={styles.name}
                style={{ color: row.color || "inherit" }}
              >
                {row.displayName}
              </span>
              <span className={styles.time}>
                {row.createdAt.toLocaleString()}
              </span>
            </div>
            <p className={styles.message}>
              <HighlightedText text={row.message} terms={KEY_TERMS} />
            </p>
          </li>
        ))}
      </ul>
      <div className={styles.bottomBar}>
        <input className={styles.input} placeholder="Share an update..." />
        <button className={styles.postButton}>Post</button>
      </div>
    </div>
  );
}
