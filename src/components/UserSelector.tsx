"use client";

import { useLocalStorage } from "../hooks/useLocalStorage";

export type UserOption = {
  id: number;
  displayName: string;
};

export default function UserSelector({ users }: { users: UserOption[] }) {
  const [selectedUserId, setSelectedUserId] = useLocalStorage<string>(
    "selectedUserId",
    ""
  );

  return (
    <select
      value={selectedUserId}
      onChange={(e) => setSelectedUserId(e.target.value)}
    >
      <option value="">Select user</option>
      {users.map((user) => (
        <option key={user.id} value={String(user.id)}>
          {user.displayName}
        </option>
      ))}
    </select>
  );
}
