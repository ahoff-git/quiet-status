"use client";

import { useState } from "react";
import Modal from "./Modal";
import styles from "./SettingsModal.module.css";
import { useSelectedUser } from "@/state/SelectedUserContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateUserModal({ isOpen, onClose }: Props) {
  const [displayName, setDisplayName] = useState("");
  const { setSelectedUserId } = useSelectedUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.id) {
        setSelectedUserId(String(data.id));
      }
    }
    onClose();
    window.location.reload();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="new-displayName">Display Name</label>
          <input
            id="new-displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        {/* Color is assigned randomly on creation */}
        <div className={styles.actions}>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit">Create</button>
        </div>
      </form>
    </Modal>
  );
}
