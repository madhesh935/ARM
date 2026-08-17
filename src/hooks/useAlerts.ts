import { useSyncExternalStore } from "react";
import { ALERTS } from "@/mock/data";
import type { AlertStatus, HealthAlert } from "@/types";

let state: HealthAlert[] = ALERTS.map((a) => ({ ...a }));
const listeners = new Set<() => void>();

function emit() {
  state = [...state];
  listeners.forEach((l) => l());
}

export function setAlertStatus(id: string, status: AlertStatus) {
  state = state.map((a) => (a.id === id ? { ...a, status } : a));
  emit();
}

export function useAlerts() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}
