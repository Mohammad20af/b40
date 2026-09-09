import { useSyncExternalStore } from "react";
import { getDemoSession, subscribeDemoSession } from "../services/demoAuth";

export function useDemoAuth() {
  return useSyncExternalStore(
    subscribeDemoSession,
    getDemoSession,
    () => false,
  );
}
