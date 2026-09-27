import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
function read(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
function set(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Private browsing may disable persistent storage. */
  }
  listeners.forEach((fn) => fn());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, () =>
    read("tracker-theme", "light"),
  );
  return [theme, (value: string) => set("tracker-theme", value)] as const;
}
export function useSaved() {
  const raw = useSyncExternalStore(subscribe, () =>
    read("tracker-saved", "[]"),
  );
  let saved: string[] = [];
  try {
    const value: unknown = JSON.parse(raw);
    if (Array.isArray(value))
      saved = value.filter((id): id is string => typeof id === "string");
  } catch {
    /* Ignore malformed storage. */
  }
  return {
    saved,
    toggle: (id: string) =>
      set(
        "tracker-saved",
        JSON.stringify(
          saved.includes(id)
            ? saved.filter((value) => value !== id)
            : [...saved, id],
        ),
      ),
    clear: () => set("tracker-saved", "[]"),
  };
}
