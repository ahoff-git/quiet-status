"use client";

import { useState } from "react";
import { useSelectedUser } from "@/state/SelectedUserContext";
import AdminUsersModal from "./AdminUsersModal";

export default function AdminButton() {
  const { selectedUserId } = useSelectedUser();
  const [open, setOpen] = useState(false);

  if (selectedUserId !== "1") return null;

  return (
    <>
      <button onClick={() => setOpen(true)}>Admin</button>
      <AdminUsersModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}

