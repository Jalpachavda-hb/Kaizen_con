/**
 * MODERATION ADMIN KEY STORE
 *
 * The moderation admin endpoints require an `X-Admin-Key` header. That key is a
 * server-side secret, so it is deliberately NOT:
 *   - committed to source or read from a VITE_* env var (Vite inlines those into the public bundle),
 *   - written to localStorage / sessionStorage / cookies.
 *
 * Instead the admin types it in once per page load and it lives only in this module's
 * memory. A full reload, logout, or "Lock" clears it.
 */
import { useSyncExternalStore } from "react";
import { STORAGE_TOKEN_KEY } from "./sessionManager";

let adminKey: string | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const getModerationAdminKey = (): string | null => adminKey;

export const setModerationAdminKey = (key: string | null): void => {
  const next = key && key.trim() ? key.trim() : null;
  if (next === adminKey) return;
  adminKey = next;
  emit();
};

export const clearModerationAdminKey = (): void => setModerationAdminKey(null);

// Drop the key whenever the admin session ends (logout or 2-hour timeout both call
// clearAuthSession(), which dispatches this event after removing the token).
if (typeof window !== "undefined") {
  window.addEventListener("ignito_session_change", () => {
    try {
      if (!localStorage.getItem(STORAGE_TOKEN_KEY)) clearModerationAdminKey();
    } catch {
      clearModerationAdminKey();
    }
  });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** React hook: returns true when an admin key is held in memory. */
export const useHasModerationAdminKey = (): boolean =>
  useSyncExternalStore(subscribe, () => adminKey !== null, () => false);
