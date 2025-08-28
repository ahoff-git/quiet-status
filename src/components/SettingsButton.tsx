"use client";

import { useState } from "react";
import SettingsModal from "./SettingsModal";
import { useLocalStorage } from "../hooks/useLocalStorage";

export default function SettingsButton() {
  const [open, setOpen] = useState(false);
  const [selectedUserId] = useLocalStorage<string>("selectedUserId", "");

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
