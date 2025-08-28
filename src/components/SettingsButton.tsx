"use client";

import { useState } from "react";
import SettingsModal from "./SettingsModal";
import { useSelectedUser } from "@/state/SelectedUserContext";

export default function SettingsButton() {
  const [open, setOpen] = useState(false);
  const { selectedUserId } = useSelectedUser();

  return (
    <>
      <button onClick={() => setOpen(true)} disabled={!selectedUserId}>
        Settings
      </button>
      <SettingsModal
        userId={selectedUserId}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
