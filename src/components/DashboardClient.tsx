"use client";

import { useState } from "react";
import UpdatesFeed from "./UpdatesFeed";
import PostBar from "./PostBar";
import type { UserOption } from "./UserSelector";
import styles from "@/app/page.module.css";

export default function DashboardClient({ users }: { users: UserOption[] }) {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <>
      <UpdatesFeed refreshToken={refreshToken} />
      <PostBar users={users} onPosted={() => setRefreshToken((x) => x + 1)} />
    </>
  );
}

