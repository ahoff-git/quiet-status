import { getDb } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import UserSelector, { type UserOption } from "../components/UserSelector";
import SettingsButton from "../components/SettingsButton";
import styles from "./page.module.css";
import DashboardClient from "@/components/DashboardClient";
import { SelectedUserProvider } from "@/state/SelectedUserContext";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const db = await getDb();

  const userOptions: UserOption[] = await db
    .select({ id: users.id, displayName: users.displayName })
    .from(users)
    .where(eq(users.isActive, true));

  return (
    <SelectedUserProvider>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <UserSelector users={userOptions} />
          <div className={styles.topBarButtons}>
            <button>Filters</button>
            <SettingsButton />
          </div>
        </div>
        <DashboardClient users={userOptions} />
      </div>
    </SelectedUserProvider>
  );
}
