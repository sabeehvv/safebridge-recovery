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
  it("returns no flags for empty or ordinary support text", () => {
    expect(extractRedFlagsFromText("")).toEqual([]);
    expect(extractRedFlagsFromText("I would like to talk to someone")).toEqual([]);
  });

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

  it.each([
    ["They are having a seizure", "seizure"],
    ["There is a serious injury", "serious_injury"],
    ["I want to kill myself", "immediate_self_harm_risk"],
    ["They have a weapon and may harm others", "immediate_violence_risk"],
    ["They are struggling to breathe", "severe_breathing_difficulty"]
  ] as const)("maps %s to %s", (text, flag) => {
    expect(extractRedFlagsFromText(text)).toContain(flag);
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

  it("routes breathing, self-harm, violence, and free-text answers to emergency", () => {
    expect(evaluateSafetyPath(assessment(), { breathing: "no" }).finalUrgency).toBe(
      "emergency"
    );
    expect(
      evaluateSafetyPath(assessment(), { breathing: "unsure" }).finalUrgency
    ).toBe("emergency");
    expect(evaluateSafetyPath(assessment(), { selfHarm: "yes" }).finalUrgency).toBe(
      "emergency"
    );
    expect(evaluateSafetyPath(assessment(), { violence: "yes" }).finalUrgency).toBe(
      "emergency"
    );
    expect(
      evaluateSafetyPath(assessment(), { note: "There is a seizure" }).finalUrgency
    ).toBe("emergency");
  });

  it.each([
    [{ isResponsive: false }, "unresponsive"],
    [{ breathingConcernReported: true }, "not_breathing_normally"],
    [{ immediateSelfHarmConcern: true }, "immediate_self_harm_risk"],
    [{ immediateViolenceConcern: true }, "immediate_violence_risk"]
  ] as const)("honors structured person red flags", (personPatch, expectedReason) => {
    const result = evaluateSafetyPath(
      assessment({ person: { ...assessment().person, ...personPatch } })
    );
    expect(result.finalUrgency).toBe("emergency");
    expect(result.overrideReason).toContain(expectedReason.replace(/_/g, " "));
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

  it("routes recent use and AI urgent support without forcing 112", () => {
    const recentUse = evaluateSafetyPath(
      assessment({
        person: { ...assessment().person, recentUseReported: true }
      })
    );
    expect(recentUse).toMatchObject({
      finalUrgency: "urgent_human_support",
      mustCall112: false
    });

    const aiUrgent = evaluateSafetyPath(
      assessment({
        aiAssessment: {
          suggestedUrgency: "urgent_human_support",
          reason: "Human support is needed.",
          confidence: 0.7
        }
      })
    );
    expect(aiUrgent.finalUrgency).toBe("urgent_human_support");
  });

  it("returns guided support when no escalation criteria apply", () => {
    expect(evaluateSafetyPath(assessment())).toEqual({
      finalUrgency: "guided_support",
      isEmergencyOverride: false,
      mustCall112: false
    });
  });

  it("handles missing optional runtime data defensively", () => {
    const incomplete = {
      ...assessment(),
      transcript: "",
      reportedRedFlags: undefined
    } as unknown as SafetyAssessment;
    const nonStringAnswer = {
      note: 42
    } as unknown as Record<string, string>;
    expect(evaluateSafetyPath(incomplete, nonStringAnswer).finalUrgency).toBe(
      "guided_support"
    );
  });
});

describe("critical question ids", () => {
  it("accepts only question ids understood by the deterministic engine", () => {
    expect(isCriticalQuestionId("breathing")).toBe(true);
    expect(isCriticalQuestionId("custom_ai_question")).toBe(false);
  });
});
