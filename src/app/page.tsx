import UpdatesFeed from './UpdatesFeed';
import { fetchUpdatesSince } from '../db/queries';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rows = await fetchUpdatesSince(since);
  return <UpdatesFeed initialUpdates={rows} />;
}
