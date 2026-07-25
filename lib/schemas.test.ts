import { describe, expect, it } from "vitest";
import { InterventionSchema, SafetyAssessmentSchema } from "./schemas";

describe("AI output schemas", () => {
  it("rejects invented resource ids", () => {
    const result = InterventionSchema.safeParse({
      urgency: "guided_support",
      immediateScript: "Stay with a trusted person.",
      immediateAction: {
        title: "Pause",
        instruction: "Move to a safer place.",
        durationMinutes: 5
      },
      trustedContactMessage: null,
      caregiverScript: null,
      relapseMap: null,
      nextThirtyMinutes: [],
      tomorrowAction: null,
      resourceIds: ["invented_helpline"],
      disclaimer: "This does not replace emergency care."
    });
    expect(result.success).toBe(false);
  });

  it("rejects clarification ids the safety engine cannot interpret", () => {
    const result = SafetyAssessmentSchema.safeParse({
      transcript: "I need help.",
      language: "en",
      mode: "craving",
      person: {
        isUser: true,
        isAlone: null,
        isResponsive: null,
        breathingConcernReported: null,
        recentUseReported: null,
        immediateSelfHarmConcern: null,
        immediateViolenceConcern: null
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
        reason: "More context is needed.",
        confidence: 0.4
      },
      missingCriticalQuestion: {
        id: "arbitraryQuestion",
        question: "Something?",
        options: ["yes", "no", "unsure"]
      },
      requiresHumanReview: true
    });
    expect(result.success).toBe(false);
  });
});
