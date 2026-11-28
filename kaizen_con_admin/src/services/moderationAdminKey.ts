/**
 * MODERATION ADMIN KEY STORE
 *
 * The moderation admin endpoints require an `X-Admin-Key` header.
 *
 * Source of the key, in priority order:
 *   1. A key typed into the "Unlock moderation" form (held in this module's memory only).
 *   2. `VITE_MODERATION_ADMIN_KEY` from the .env file (gitignored, never committed).
 *
 * NOTE: Vite inlines every VITE_* variable into the built JavaScript bundle, so anyone who
 * can load the admin app can read this key from the bundle. Leave the variable empty in
 * public builds to fall back to manual entry.
 *
 * Neither source is ever written to localStorage / sessionStorage / cookies.
 */
import { useSyncExternalStore } from "react";
import { STORAGE_TOKEN_KEY } from "./sessionManager";

const ENV_ADMIN_KEY: string | null = (() => {
  const raw = (import.meta.env?.VITE_MODERATION_ADMIN_KEY as string | undefined) ?? "";
  return raw.trim() ? raw.trim() : null;
})();

let adminKey: string | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const getModerationAdminKey = (): string | null => adminKey ?? ENV_ADMIN_KEY;

/** True when requests are using the .env key (no manually entered key overrides it). */
export const isModerationKeyFromEnv = (): boolean => adminKey === null && ENV_ADMIN_KEY !== null;

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

/** React hook: returns true when an admin key is available (entered manually or from .env). */
export const useHasModerationAdminKey = (): boolean =>
  useSyncExternalStore(subscribe, () => getModerationAdminKey() !== null, () => false);

/** React hook: returns true when a manually entered key is held in memory (so "Lock" has an effect). */
export const useHasManualModerationAdminKey = (): boolean =>
  useSyncExternalStore(subscribe, () => adminKey !== null, () => false);
