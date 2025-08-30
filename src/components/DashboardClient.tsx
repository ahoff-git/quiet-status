"use client";

import { useState } from "react";
import UpdatesFeed from "./UpdatesFeed";
import PostBar from "./PostBar";
import type { UserOption } from "./UserSelector";

export default function DashboardClient({ users }: { users: UserOption[] }) {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <>
      <UpdatesFeed refreshToken={refreshToken} users={users} />
      <PostBar users={users} onPosted={() => setRefreshToken((x) => x + 1)} />
    </>
  );
}
