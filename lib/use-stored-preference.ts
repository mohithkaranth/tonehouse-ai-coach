"use client";

import { useSyncExternalStore } from "react";

const preferenceChanged = "tonehouse-preference-changed";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(preferenceChanged, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(preferenceChanged, onChange);
  };
}

export function useStoredPreference<T extends string>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => (window.localStorage.getItem(key) as T | null) ?? fallback,
    () => fallback,
  );

  function setValue(next: T) {
    window.localStorage.setItem(key, next);
    window.dispatchEvent(new Event(preferenceChanged));
  }

  return [value, setValue] as const;
}
