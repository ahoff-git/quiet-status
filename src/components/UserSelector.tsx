"use client";

import { useState } from "react";
import { useSelectedUser } from "@/state/SelectedUserContext";
import CreateUserModal from "./CreateUserModal";

export type UserOption = {
  id: number;
  displayName: string;
  color: string | null;
};

const ADD_NEW_VALUE = "__add_new__";

export default function UserSelector({ users }: { users: UserOption[] }) {
  const { selectedUserId, setSelectedUserId } = useSelectedUser();
  const [open, setOpen] = useState(false);

  return (
    <>
      <select
        value={selectedUserId}
        onChange={async (e) => {
          const value = e.target.value;
          if (value === ADD_NEW_VALUE) {
            // Open create user modal and keep previous selection
            setOpen(true);
            return;
          }
          if (!value) {
            setSelectedUserId("");
            return;
          }
          // Check if user has a password; if so, prompt + verify before setting
          try {
            const res = await fetch(`/api/users/${value}/settings`);
            const data = await res.json();
            if (data?.hasPassword) {
              const pwd = window.prompt("Enter password for this account:");
              if (pwd === null) return; // user cancelled, keep previous selection
              const auth = await fetch(`/api/users/${value}/auth`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: pwd }),
              });
              if (!auth.ok) {
                window.alert("Incorrect password");
                return;
              }
            }
            setSelectedUserId(value);
          } catch (err) {
            console.error(err);
            window.alert("Unable to switch user");
          }
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
