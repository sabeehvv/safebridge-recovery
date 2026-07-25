import { z } from "zod";

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
export const SAFETY_CARD_CHANGED_EVENT = "safebridge:safety-card-changed";
const RecoverySafetyCardSchema = z.object({
  preferredName: z.string().max(100),
  trustedContactName: z.string().max(100),
  trustedContactPhone: z.string().max(30),
  warningSigns: z.array(z.string().max(200)).max(20),
  whatHelps: z.array(z.string().max(200)).max(20),
  caregiverShouldSay: z.array(z.string().max(300)).max(20),
  caregiverShouldAvoid: z.array(z.string().max(300)).max(20),
  professionalSupportPhone: z.string().max(30),
  emergencyPhone: z.string().max(30),
  preferredLanguage: z.enum(["en", "ml"]),
  updatedAt: z.string().datetime()
});

export function normalizePhoneNumber(value: string): string {
  const trimmed = value.trim();
  const hasLeadingPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "").slice(0, 15);
  return `${hasLeadingPlus ? "+" : ""}${digits}`;
}

export function getSavedSafetyCard(): RecoverySafetyCard | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const result = RecoverySafetyCardSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch (e) {
    console.error("Failed to read safety card from localStorage", e);
    return null;
  }
}

export function getSavedSafetyCardRaw(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function parseSavedSafetyCard(raw: string | null): RecoverySafetyCard | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    const result = RecoverySafetyCardSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function saveSafetyCard(card: RecoverySafetyCard): boolean {
  if (typeof window === "undefined") return false;
  try {
    const result = RecoverySafetyCardSchema.safeParse(card);
    if (!result.success) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
    window.dispatchEvent(new Event(SAFETY_CARD_CHANGED_EVENT));
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
    window.dispatchEvent(new Event(SAFETY_CARD_CHANGED_EVENT));
    return true;
  } catch (e) {
    console.error("Failed to delete safety card from localStorage", e);
    return false;
  }
}
