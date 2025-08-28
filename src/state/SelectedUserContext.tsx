"use client";

import { createContext, useContext, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type Ctx = {
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
};

const SelectedUserContext = createContext<Ctx | undefined>(undefined);

export function SelectedUserProvider({ children }: { children: React.ReactNode }) {
  const [selectedUserId, setSelectedUserId] = useLocalStorage<string>("selectedUserId", "");

  const value = useMemo<Ctx>(() => ({ selectedUserId, setSelectedUserId }), [selectedUserId]);

  return (
    <SelectedUserContext.Provider value={value}>{children}</SelectedUserContext.Provider>
  );
}

export function useSelectedUser() {
  const ctx = useContext(SelectedUserContext);
  if (!ctx) throw new Error("useSelectedUser must be used within SelectedUserProvider");
  return ctx;
}

