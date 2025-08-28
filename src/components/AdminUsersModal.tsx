"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import { useSelectedUser } from "@/state/SelectedUserContext";

type UserRow = { id: number; displayName: string; hasPassword: boolean };

export default function AdminUsersModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedUserId } = useSelectedUser();

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users`);
      const data: UserRow[] = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) void refresh();
  }, [isOpen]);

  const clearPassword = async (id: number) => {
    const confirmClear = window.confirm("Clear password for this user?");
    if (!confirmClear) return;
    await fetch(`/api/users/${id}/password`, {
      method: "DELETE",
      headers: {
        "X-User-Id": String(selectedUserId || ""),
      },
    });
    await refresh();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 360 }}>
        <h3 style={{ margin: 0 }}>Admin: Manage Users</h3>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {users.map((u) => (
              <div key={u.id} style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{u.displayName}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>ID: {u.id} · {u.hasPassword ? "Has password" : "No password"}</div>
                </div>
                <button onClick={() => clearPassword(u.id)} disabled={!u.hasPassword}>
                  Clear Password
                </button>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </Modal>
  );
}

