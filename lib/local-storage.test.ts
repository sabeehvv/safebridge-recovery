import { describe, expect, it } from "vitest";
import { normalizePhoneNumber } from "./local-storage";

describe("normalizePhoneNumber", () => {
  it("keeps a leading plus and strips URI control characters", () => {
    expect(normalizePhoneNumber("+91 (98765) 43210;evil")).toBe("+919876543210");
  });

  it("limits numbers to the E.164 maximum length", () => {
    expect(normalizePhoneNumber("12345678901234567890")).toBe("123456789012345");
  });
});
