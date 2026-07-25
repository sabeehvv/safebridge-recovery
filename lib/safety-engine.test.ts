import { describe, expect, it } from "vitest";
import {
  evaluateSafetyPath,
  extractRedFlagsFromText,
  isCriticalQuestionId
} from "./safety-engine";
import { SafetyAssessment } from "./schemas";

function assessment(overrides: Partial<SafetyAssessment> = {}): SafetyAssessment {
  return {
    transcript: "I need support with a craving.",
    language: "en",
    mode: "craving",
    person: {
      isUser: true,
      isAlone: null,
      isResponsive: true,
      breathingConcernReported: false,
      recentUseReported: false,
      immediateSelfHarmConcern: false,
      immediateViolenceConcern: false
    },
    context: {
      substanceCategory: "unknown",
      triggeringSituation: null,
      emotions: [],
      locationContext: null,
      trustedPersonAvailable: null
    },
    reportedRedFlags: [],
    aiAssessment: {
      suggestedUrgency: "guided_support",
      reason: "No acute red flag was reported.",
      confidence: 0.5
    },
    missingCriticalQuestion: null,
    requiresHumanReview: true,
    ...overrides
  };
}

describe("extractRedFlagsFromText", () => {
  it("detects English and Malayalam acute red flags", () => {
    expect(extractRedFlagsFromText("They are not breathing normally")).toContain(
      "not_breathing_normally"
    );
    expect(extractRedFlagsFromText("അവൻ ഉണരുന്നില്ല")).toContain("unresponsive");
  });

  it("does not classify a panic attack as violence", () => {
    expect(extractRedFlagsFromText("I think I am having a panic attack")).not.toContain(
      "immediate_violence_risk"
    );
  });
});

describe("evaluateSafetyPath", () => {
  it("prevents AI from downgrading a deterministic red flag", () => {
    const result = evaluateSafetyPath(
      assessment({ transcript: "The person is unresponsive" })
    );
    expect(result.finalUrgency).toBe("emergency");
    expect(result.isEmergencyOverride).toBe(true);
    expect(result.mustCall112).toBe(true);
  });

  it("routes no or unsure responsiveness answers to emergency", () => {
    expect(
      evaluateSafetyPath(assessment(), { isResponsive: "no" }).finalUrgency
    ).toBe("emergency");
    expect(
      evaluateSafetyPath(assessment(), { isResponsive: "unsure" }).finalUrgency
    ).toBe("emergency");
  });

  it("honors an AI escalation even without a deterministic flag", () => {
    const result = evaluateSafetyPath(
      assessment({
        aiAssessment: {
          suggestedUrgency: "emergency",
          reason: "Escalation is required.",
          confidence: 0.8
        }
      })
    );
    expect(result.finalUrgency).toBe("emergency");
    expect(result.isEmergencyOverride).toBe(false);
  });
});

describe("critical question ids", () => {
  it("accepts only question ids understood by the deterministic engine", () => {
    expect(isCriticalQuestionId("breathing")).toBe(true);
    expect(isCriticalQuestionId("custom_ai_question")).toBe(false);
  });
});
