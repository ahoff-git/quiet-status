"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import styles from "./SettingsModal.module.css";
import { useSelectedUser } from "@/state/SelectedUserContext";
import { randomHexColor } from "@/utils/color";

interface Props {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ userId, isOpen, onClose }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [color, setColor] = useState("#000000");
  const { setSelectedUserId } = useSelectedUser();

  useEffect(() => {
    if (!isOpen || !userId) return;
    fetch(`/api/users/${userId}/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.displayName) setDisplayName(data.displayName);
        if (data?.color) setColor(data.color);
      });
  }, [isOpen, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/users/${userId}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, color }),
    });
    onClose();
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!userId) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this user from the list?"
    );
    if (!confirmDelete) return;
    await fetch(`/api/users/${userId}/settings`, { method: "DELETE" });
    setSelectedUserId("");
    onClose();
    window.location.reload();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="displayName">Display Name</label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="color">Color</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              id="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ width: 48, height: 32, padding: 0, border: 0, background: "none" }}
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-label="Color hex"
              style={{ flex: 1 }}
            />
            <button type="button" onClick={() => setColor(randomHexColor())}>
              Randomize
            </button>
          </div>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={handleDelete}>
            Delete User
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit">Save</button>
        </div>
      </form>
    </Modal>
  );
}
