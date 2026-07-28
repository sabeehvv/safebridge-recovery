import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { Intervention, SafetyAssessment } from "@/lib/schemas";

const geminiMocks = vi.hoisted(() => ({
  analyzeSituationAudio: vi.fn(),
  generateIntervention: vi.fn()
}));

vi.mock("@/lib/gemini", () => geminiMocks);

import { POST } from "./route";

const assessment: SafetyAssessment = {
  transcript: "I need support right now.",
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
  requiresHumanReview: true
};

const intervention: Intervention = {
  urgency: "guided_support",
  immediateScript: "Move to a safe place and contact someone you trust.",
  immediateAction: {
    title: "Safety pause",
    instruction: "Stay with a trusted person.",
    durationMinutes: 5
  },
  trustedContactMessage: "Please stay with me for a while.",
  caregiverScript: null,
  relapseMap: null,
  nextThirtyMinutes: ["Stay in a safe place."],
  tomorrowAction: "Contact a recovery professional.",
  resourceIds: ["nmba_14446"],
  disclaimer: "This does not replace emergency or clinical care."
};

function formRequest(
  entries: Record<string, string | File>,
  headers?: Record<string, string>
): NextRequest {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.append(key, value);
  }
  return new NextRequest("http://localhost/api/analyse-situation", {
    method: "POST",
    body: formData,
    headers
  });
}

async function payload(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

beforeEach(() => {
  geminiMocks.analyzeSituationAudio.mockReset();
  geminiMocks.generateIntervention.mockReset();
  geminiMocks.generateIntervention.mockResolvedValue(intervention);
});

describe("POST /api/analyse-situation", () => {
  it("rejects oversized requests before parsing multipart data", async () => {
    const request = new NextRequest("http://localhost/api/analyse-situation", {
      method: "POST",
      headers: { "content-length": String(11 * 1024 * 1024) }
    });
    const response = await POST(request);
    expect(response.status).toBe(413);
    expect(await payload(response)).toMatchObject({ isSafetyOnlyMode: true });
  });

  it("rejects invalid intake settings", async () => {
    const response = await POST(
      formRequest({ mode: "invalid", language: "en", textFallback: "Help" })
    );
    expect(response.status).toBe(400);
  });

  it("requires audio or accessibility text", async () => {
    const response = await POST(formRequest({ mode: "craving", language: "en" }));
    expect(response.status).toBe(400);
  });

  it("rejects an overlong text report", async () => {
    const response = await POST(
      formRequest({
        mode: "craving",
        language: "en",
        textFallback: "x".repeat(10_001)
      })
    );
    expect(response.status).toBe(413);
  });

  it("rejects empty and unsupported audio", async () => {
    const emptyResponse = await POST(
      formRequest({
        mode: "craving",
        language: "en",
        audio: new File([], "empty.webm", { type: "audio/webm" })
      })
    );
    expect(emptyResponse.status).toBe(413);

    const unsupportedResponse = await POST(
      formRequest({
        mode: "craving",
        language: "en",
        audio: new File(["data"], "audio.txt", { type: "text/plain" })
      })
    );
    expect(unsupportedResponse.status).toBe(415);
  });

  it("bypasses Gemini immediately for deterministic text red flags", async () => {
    const response = await POST(
      formRequest({
        mode: "caregiver_concern",
        language: "en",
        textFallback: "They are unresponsive and not breathing normally."
      })
    );
    const body = await payload(response);
    expect(body.isSafetyOnlyMode).toBe(false);
    expect(body.intervention).toBeNull();
    expect(body.safetyEval).toMatchObject({
      finalUrgency: "emergency",
      mustCall112: true
    });
    expect(geminiMocks.analyzeSituationAudio).not.toHaveBeenCalled();
    expect(geminiMocks.generateIntervention).not.toHaveBeenCalled();
  });

  it.each([
    ["I want to kill myself", "immediateSelfHarmConcern"],
    ["I have a weapon and may harm others", "immediateViolenceConcern"]
  ])("maps deterministic text concern: %s", async (text, personField) => {
    const response = await POST(
      formRequest({
        mode: "craving",
        language: "en",
        textFallback: text
      })
    );
    const body = await payload(response);
    expect(
      (body.assessment as SafetyAssessment).person[
        personField as keyof SafetyAssessment["person"]
      ]
    ).toBe(true);
  });

  it.each([
    ["caregiver_concern", "isResponsive", false],
    ["recent_substance_use", "breathing", false],
    ["craving", null, true]
  ])("builds safe text intake for %s", async (mode, questionId, hasIntervention) => {
    const response = await POST(
      formRequest({
        mode,
        language: "en",
        textFallback: "I need support."
      })
    );
    const body = await payload(response);
    expect(response.status).toBe(200);
    expect(body.isSafetyOnlyMode).toBe(false);
    expect(Boolean(body.intervention)).toBe(hasIntervention);
    expect(
      (body.assessment as SafetyAssessment).missingCriticalQuestion?.id ?? null
    ).toBe(questionId);
  });

  it("generates guidance only after a safe clarification answer", async () => {
    const needsClarification: SafetyAssessment = {
      ...assessment,
      mode: "recent_substance_use",
      missingCriticalQuestion: {
        id: "breathing",
        question: "Are you breathing normally right now?",
        options: ["yes", "no", "unsure"]
      }
    };
    const request = new NextRequest("http://localhost/api/analyse-situation", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        assessment: needsClarification,
        answers: { breathing: "yes" }
      })
    });
    const response = await POST(request);
    const body = await payload(response);
    expect(body.intervention).toEqual(intervention);
    expect(geminiMocks.generateIntervention).toHaveBeenCalledWith(
      expect.objectContaining({ missingCriticalQuestion: null }),
      { breathing: "yes" }
    );
  });

  it("routes an unsafe clarification answer without generating guidance", async () => {
    const needsClarification: SafetyAssessment = {
      ...assessment,
      mode: "caregiver_concern",
      missingCriticalQuestion: {
        id: "isResponsive",
        question: "Is the person responding?",
        options: ["yes", "no", "unsure"]
      }
    };
    const request = new NextRequest("http://localhost/api/analyse-situation", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        assessment: needsClarification,
        answers: { isResponsive: "no" }
      })
    });
    const response = await POST(request);
    const body = await payload(response);
    expect(body.intervention).toBeNull();
    expect(body.safetyEval).toMatchObject({ finalUrgency: "emergency" });
    expect(geminiMocks.generateIntervention).not.toHaveBeenCalled();
  });

  it("rejects invalid or mismatched clarification payloads", async () => {
    const invalidRequest = new NextRequest("http://localhost/api/analyse-situation", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ assessment, answers: { breathing: "maybe" } })
    });
    expect((await POST(invalidRequest)).status).toBe(400);

    const missingAnswerRequest = new NextRequest(
      "http://localhost/api/analyse-situation",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assessment: {
            ...assessment,
            missingCriticalQuestion: {
              id: "breathing",
              question: "Are you breathing normally?",
              options: ["yes", "no", "unsure"]
            }
          },
          answers: { isResponsive: "yes" }
        })
      }
    );
    expect((await POST(missingAnswerRequest)).status).toBe(400);
  });

  it("analyzes supported browser audio and returns intervention", async () => {
    geminiMocks.analyzeSituationAudio.mockResolvedValue(assessment);
    const response = await POST(
      formRequest({
        mode: "craving",
        language: "en",
        audio: new File(["audio"], "voice.webm", {
          type: "audio/webm;codecs=opus"
        })
      })
    );
    expect(response.status).toBe(200);
    expect(geminiMocks.analyzeSituationAudio).toHaveBeenCalledWith(
      expect.any(Buffer),
      "audio/webm",
      "craving",
      "en"
    );
    expect(geminiMocks.generateIntervention).toHaveBeenCalledWith(
      assessment,
      undefined
    );
  });

  it("activates Safety-Only Mode when audio analysis fails", async () => {
    geminiMocks.analyzeSituationAudio.mockRejectedValue(new Error("timeout"));
    const response = await POST(
      formRequest({
        mode: "craving",
        language: "en",
        audio: new File(["audio"], "voice.ogg", { type: "audio/ogg" })
      })
    );
    expect(await payload(response)).toMatchObject({ isSafetyOnlyMode: true });
    expect(geminiMocks.generateIntervention).not.toHaveBeenCalled();
  });

  it("activates Safety-Only Mode when intervention generation fails", async () => {
    geminiMocks.generateIntervention.mockRejectedValue(new Error("unavailable"));
    const response = await POST(
      formRequest({
        mode: "craving",
        language: "ml",
        textFallback: "എനിക്ക് സഹായം വേണം"
      })
    );
    expect(await payload(response)).toMatchObject({ isSafetyOnlyMode: true });
  });

  it("handles a non-Error provider rejection without exposing it", async () => {
    geminiMocks.generateIntervention.mockRejectedValue("provider unavailable");
    const response = await POST(
      formRequest({
        mode: "craving",
        language: "en",
        textFallback: "I need support."
      })
    );
    expect(await payload(response)).toMatchObject({ isSafetyOnlyMode: true });
  });

  it("returns a safe 500 response for malformed request bodies", async () => {
    const request = new NextRequest("http://localhost/api/analyse-situation", {
      method: "POST",
      body: "not multipart",
      headers: { "content-type": "text/plain" }
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(await payload(response)).toMatchObject({ isSafetyOnlyMode: true });
  });
});
