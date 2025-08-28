"use client";

import { useState } from "react";
import Modal from "./Modal";
import styles from "./SettingsModal.module.css";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateUserModal({ isOpen, onClose }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [color, setColor] = useState("#000000");
  const [, setSelectedUserId] = useLocalStorage<string>("selectedUserId", "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, color }),
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
        <div className={styles.formGroup}>
          <label htmlFor="new-color">Color</label>
          <input
            id="new-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
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

