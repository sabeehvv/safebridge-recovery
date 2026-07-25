export interface RecoverySafetyCard {
  preferredName: string;
  trustedContactName: string;
  trustedContactPhone: string;
  warningSigns: string[];
  whatHelps: string[];
  caregiverShouldSay: string[];
  caregiverShouldAvoid: string[];
  professionalSupportPhone: string;
  emergencyPhone: string;
  preferredLanguage: "en" | "ml";
  updatedAt: string;
}

const STORAGE_KEY = "safebridge_recovery_card";

export function getSavedSafetyCard(): RecoverySafetyCard | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to read safety card from localStorage", e);
    return null;
  }
}

export function saveSafetyCard(card: RecoverySafetyCard): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(card));
    return true;
  } catch (e) {
    console.error("Failed to save safety card to localStorage", e);
    return false;
  }
}

export function deleteSafetyCard(): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error("Failed to delete safety card from localStorage", e);
    return false;
  }
}
