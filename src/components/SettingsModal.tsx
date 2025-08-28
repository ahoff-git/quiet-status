"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import styles from "./SettingsModal.module.css";
import { useSelectedUser } from "@/state/SelectedUserContext";
import { randomHexColor } from "@/utils/color";
import { useFontSize } from "@/state/FontSizeContext";

interface Props {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ userId, isOpen, onClose }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [color, setColor] = useState("#000000");
  const { fontSize: currentFontSize, setFontSize: setContextFontSize } = useFontSize();
  const [fontSize, setFontSize] = useState<number>(currentFontSize);
  const { setSelectedUserId, selectedUserId } = useSelectedUser();
  const [hasPassword, setHasPassword] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>("");

  useEffect(() => {
    if (!isOpen || !userId) return;
    fetch(`/api/users/${userId}/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.displayName) setDisplayName(data.displayName);
        if (data?.color) setColor(data.color);
        if (typeof data?.fontSize === "number") setFontSize(data.fontSize);
        if (typeof data?.hasPassword === "boolean") setHasPassword(Boolean(data.hasPassword));
      });
  }, [isOpen, userId]);

  useEffect(() => {
    setFontSize(currentFontSize);
  }, [currentFontSize]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/users/${userId}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, color, fontSize }),
    });
    setContextFontSize(fontSize);
    onClose();
    window.location.reload();
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    await fetch(`/api/users/${userId}/password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": String(selectedUserId || ""),
      },
      body: JSON.stringify({ password: newPassword }),
    });
    setNewPassword("");
    setHasPassword(true);
    onClose();
    window.location.reload();
  };

  const handleClearPassword = async () => {
    const canClear = selectedUserId === userId || selectedUserId === "1";
    if (!canClear) return;
    const confirmClear = window.confirm("Remove password for this account?");
    if (!confirmClear) return;
    await fetch(`/api/users/${userId}/password`, {
      method: "DELETE",
      headers: {
        "X-User-Id": String(selectedUserId || ""),
      },
    });
    setHasPassword(false);
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
        <div className={styles.formGroup}>
          <label htmlFor="fontSize">Font Size</label>
          <input
            id="fontSize"
            type="number"
            min={12}
            max={32}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              id="password"
              type="password"
              placeholder={hasPassword ? "Set new password" : "Set password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="button" onClick={handleSetPassword} disabled={!newPassword}>
              {hasPassword ? "Update" : "Set"}
            </button>
            {(selectedUserId === userId || selectedUserId === "1") && hasPassword && (
              <button type="button" onClick={handleClearPassword}>
                Clear Password
              </button>
            )}
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            {hasPassword ? "Password is set" : "No password set"}
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
