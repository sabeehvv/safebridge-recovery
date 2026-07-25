import { afterEach, describe, expect, it, vi } from "vitest";
import {
  deleteSafetyCard,
  getSavedSafetyCard,
  getSavedSafetyCardRaw,
  normalizePhoneNumber,
  parseSavedSafetyCard,
  RecoverySafetyCard,
  SAFETY_CARD_CHANGED_EVENT,
  saveSafetyCard
} from "./local-storage";

const validCard: RecoverySafetyCard = {
  preferredName: "Alex",
  trustedContactName: "Sam",
  trustedContactPhone: "+919876543210",
  warningSigns: ["Isolation"],
  whatHelps: ["Call Sam"],
  caregiverShouldSay: ["I am here"],
  caregiverShouldAvoid: ["Blame"],
  professionalSupportPhone: "14446",
  emergencyPhone: "112",
  preferredLanguage: "en",
  updatedAt: "2026-07-25T00:00:00.000Z"
};

function installStorage(initialValue: string | null = null) {
  let value = initialValue;
  const storage = {
    getItem: vi.fn(() => value),
    setItem: vi.fn((_key: string, next: string) => {
      value = next;
    }),
    removeItem: vi.fn(() => {
      value = null;
    })
  };
  const browserWindow = new EventTarget();
  const dispatchSpy = vi.spyOn(browserWindow, "dispatchEvent");
  vi.stubGlobal("window", browserWindow);
  vi.stubGlobal("localStorage", storage);
  return { storage, dispatchSpy };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("normalizePhoneNumber", () => {
  it("keeps a leading plus and strips URI control characters", () => {
    expect(normalizePhoneNumber("+91 (98765) 43210;evil")).toBe("+919876543210");
  });

  it("normalizes local numbers and enforces the E.164 maximum", () => {
    expect(normalizePhoneNumber(" 112 ")).toBe("112");
    expect(normalizePhoneNumber("12345678901234567890")).toBe("123456789012345");
  });
});

describe("recovery safety card storage", () => {
  it("returns null safely outside the browser", () => {
    expect(getSavedSafetyCard()).toBeNull();
    expect(getSavedSafetyCardRaw()).toBeNull();
    expect(saveSafetyCard(validCard)).toBe(false);
    expect(deleteSafetyCard()).toBe(false);
  });

  it("reads and validates saved cards", () => {
    installStorage(JSON.stringify(validCard));
    expect(getSavedSafetyCard()).toEqual(validCard);
    expect(getSavedSafetyCardRaw()).toBe(JSON.stringify(validCard));
  });

  it("rejects empty, malformed, and invalid stored data", () => {
    const { storage } = installStorage(null);
    expect(getSavedSafetyCard()).toBeNull();
    expect(parseSavedSafetyCard(null)).toBeNull();
    expect(parseSavedSafetyCard("{bad json")).toBeNull();
    expect(parseSavedSafetyCard(JSON.stringify({ preferredName: "Incomplete" }))).toBeNull();

    storage.getItem.mockReturnValueOnce("{bad json");
    expect(getSavedSafetyCard()).toBeNull();
    storage.getItem.mockReturnValueOnce(JSON.stringify({ preferredName: "Incomplete" }));
    expect(getSavedSafetyCard()).toBeNull();

    expect(parseSavedSafetyCard(JSON.stringify(validCard))).toEqual(validCard);
  });

  it("saves valid cards and announces the change", () => {
    const { storage, dispatchSpy } = installStorage();
    expect(saveSafetyCard(validCard)).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(
      "safebridge_recovery_card",
      JSON.stringify(validCard)
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: SAFETY_CARD_CHANGED_EVENT })
    );
  });

  it("rejects invalid cards without writing", () => {
    const { storage } = installStorage();
    expect(
      saveSafetyCard({ ...validCard, trustedContactPhone: "1".repeat(31) })
    ).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("deletes a card and announces the change", () => {
    const { storage, dispatchSpy } = installStorage(JSON.stringify(validCard));
    expect(deleteSafetyCard()).toBe(true);
    expect(storage.removeItem).toHaveBeenCalledWith("safebridge_recovery_card");
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("handles browser storage failures", () => {
    const { storage } = installStorage();
    storage.getItem.mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(getSavedSafetyCard()).toBeNull();

    storage.setItem.mockImplementation(() => {
      throw new Error("full");
    });
    expect(saveSafetyCard(validCard)).toBe(false);

    storage.removeItem.mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(deleteSafetyCard()).toBe(false);
  });
});
