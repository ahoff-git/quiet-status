import { getDb } from "../db";
import { users, userSettings } from "../db/schema";
import { eq } from "drizzle-orm";
import UserSelector, { type UserOption } from "../components/UserSelector";
import SettingsButton from "../components/SettingsButton";
import AdminButton from "@/components/AdminButton";
import styles from "./page.module.css";
import DashboardClient from "@/components/DashboardClient";
import { SelectedUserProvider } from "@/state/SelectedUserContext";
import { FontSizeProvider } from "@/state/FontSizeContext";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const db = await getDb();

  const userOptions: UserOption[] = await db
    .select({ id: users.id, displayName: users.displayName, color: userSettings.color })
    .from(users)
    .leftJoin(userSettings, eq(users.id, userSettings.userId))
    .where(eq(users.isActive, true));

  return (
    <SelectedUserProvider>
      <FontSizeProvider>
        <div className={styles.container}>
          <div className={styles.topBar}>
            <UserSelector users={userOptions} />
            <div className={styles.topBarButtons}>
              <button>Filters</button>
              <AdminButton />
              <SettingsButton />
            </div>
          </div>
          <DashboardClient users={userOptions} />
        </div>
      </FontSizeProvider>
    </SelectedUserProvider>
  );
}
