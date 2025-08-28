"use client";

import { useState } from "react";
import { useSelectedUser } from "@/state/SelectedUserContext";
import CreateUserModal from "./CreateUserModal";

export type UserOption = {
  id: number;
  displayName: string;
};

const ADD_NEW_VALUE = "__add_new__";

export default function UserSelector({ users }: { users: UserOption[] }) {
  const { selectedUserId, setSelectedUserId } = useSelectedUser();
  const [open, setOpen] = useState(false);

  return (
    <>
      <select
        value={selectedUserId}
        onChange={(e) => {
          const value = e.target.value;
          if (value === ADD_NEW_VALUE) {
            // Open create user modal and keep previous selection
            setOpen(true);
            return;
          }
          setSelectedUserId(value);
        }}
      >
        <option value="">Select user</option>
        {users.map((user) => (
          <option key={user.id} value={String(user.id)}>
            {user.displayName}
          </option>
        ))}
        <option value={ADD_NEW_VALUE}>+ Add new user…</option>
      </select>
      <CreateUserModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
