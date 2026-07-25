"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getSavedSafetyCardRaw,
  parseSavedSafetyCard,
  SAFETY_CARD_CHANGED_EVENT
} from "./local-storage";

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SAFETY_CARD_CHANGED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SAFETY_CARD_CHANGED_EVENT, onStoreChange);
  };
}

export function useSavedSafetyCard() {
  const raw = useSyncExternalStore(subscribe, getSavedSafetyCardRaw, () => null);
  return useMemo(() => parseSavedSafetyCard(raw), [raw]);
}
