import { NextRequest, NextResponse } from "next/server";
import { analyzeSituationAudio, generateIntervention } from "@/lib/gemini";
import { evaluateSafetyPath, extractRedFlagsFromText } from "@/lib/safety-engine";
import {
  Language,
  LanguageSchema,
  ClarificationRequestSchema,
  SafetyAssessment,
  SituationMode,
  SituationModeSchema
} from "@/lib/schemas";

export const runtime = "nodejs";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_AUDIO_BYTES + 256 * 1024;
const MAX_TEXT_LENGTH = 10_000;
const ALLOWED_AUDIO_TYPES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav"
]);

function normalizeMimeType(value: string): string {
  return value.toLowerCase().split(";", 1)[0].trim();
}

function safetyOnly(errorReason: string, status = 200) {
  return NextResponse.json(
    {
      isSafetyOnlyMode: true,
      errorReason
    },
    { status }
  );
}

function buildDeterministicTextAssessment(
  text: string,
  mode: SituationMode,
  language: Language
): SafetyAssessment {
  const redFlags = extractRedFlagsFromText(text);
  const redFlagSet = new Set(redFlags);
  const hasBreathingFlag =
    redFlagSet.has("not_breathing_normally") ||
    redFlagSet.has("severe_breathing_difficulty");

  return {
    transcript: text,
    language,
    mode,
    person: {
      isUser: mode !== "caregiver_concern",
      isAlone: null,
      isResponsive: redFlagSet.has("unresponsive") ? false : null,
      breathingConcernReported: hasBreathingFlag ? true : null,
      recentUseReported: mode === "recent_substance_use",
      immediateSelfHarmConcern: redFlagSet.has("immediate_self_harm_risk") ? true : null,
      immediateViolenceConcern: redFlagSet.has("immediate_violence_risk") ? true : null
    },
    context: {
      substanceCategory: "unknown",
      triggeringSituation: text,
      emotions: [],
      locationContext: null,
      trustedPersonAvailable: null
    },
    reportedRedFlags: redFlags,
    aiAssessment: {
      suggestedUrgency: redFlags.length > 0 ? "emergency" : "guided_support",
      reason:
        redFlags.length > 0
          ? "Acute red flags identified by the deterministic text safety check."
          : "Accessibility text intake received; critical facts still require confirmation.",
      confidence: redFlags.length > 0 ? 1 : 0
    },
    missingCriticalQuestion:
      redFlags.length > 0
        ? null
        : mode === "caregiver_concern"
          ? {
              id: "isResponsive",
              question: "Is the person awake and responding normally?",
              options: ["yes", "no", "unsure"]
            }
          : mode === "recent_substance_use"
            ? {
                id: "breathing",
                question: "Are you breathing normally right now?",
                options: ["yes", "no", "unsure"]
              }
            : null,
    requiresHumanReview: true
  };
}

function logServerError(context: string, error: unknown): void {
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : "Unknown error";
  console.error(`${context}: ${detail}`);
}

async function completeAssessment(
  assessment: SafetyAssessment,
  answers?: Record<string, string>
) {
  const safetyEval = evaluateSafetyPath(assessment, answers);
  if (safetyEval.finalUrgency === "emergency") {
    return NextResponse.json({
      assessment,
      safetyEval,
      intervention: null,
      isSafetyOnlyMode: false
    });
  }

  try {
    const intervention = await generateIntervention(assessment, answers);
    return NextResponse.json({
      assessment,
      safetyEval,
      intervention,
      isSafetyOnlyMode: false
    });
  } catch (error: unknown) {
    logServerError("Gemini intervention generation failed", error);
    return safetyOnly(
      "Personalized recovery guidance is temporarily unavailable. Verified safety actions remain available."
    );
  }
}

export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return safetyOnly("The recording is too large. Use a shorter recording or call 112 in an emergency.", 413);
  }

  try {
    if (req.headers.get("content-type")?.startsWith("application/json")) {
      const parsed = ClarificationRequestSchema.safeParse(await req.json());
      if (!parsed.success) {
        return safetyOnly("The safety clarification was invalid. Please start a new report.", 400);
      }

      const questionId = parsed.data.assessment.missingCriticalQuestion?.id;
      if (!questionId || !parsed.data.answers[questionId]) {
        return safetyOnly("The required safety question was not answered.", 400);
      }

      const clarifiedAssessment: SafetyAssessment = {
        ...parsed.data.assessment,
        missingCriticalQuestion: null
      };
      return completeAssessment(clarifiedAssessment, parsed.data.answers);
    }

    const formData = await req.formData();
    const audioEntry = formData.get("audio");
    const audioFile = audioEntry instanceof File ? audioEntry : null;
    const modeResult = SituationModeSchema.safeParse(formData.get("mode"));
    const languageResult = LanguageSchema.safeParse(formData.get("language"));
    const textEntry = formData.get("textFallback");
    const textFallback = typeof textEntry === "string" ? textEntry.trim() : "";

    if (!modeResult.success || !languageResult.success) {
      return safetyOnly("The intake settings were invalid. Please start a new report.", 400);
    }
    const mode = modeResult.data;
    const language = languageResult.data;

    if (!audioFile && !textFallback) {
      return safetyOnly("A voice recording or accessibility text report is required.", 400);
    }
    if (textFallback.length > MAX_TEXT_LENGTH) {
      return safetyOnly("The text report is too long. Please shorten it and try again.", 413);
    }
    if (audioFile) {
      const mimeType = normalizeMimeType(audioFile.type);
      if (audioFile.size === 0 || audioFile.size > MAX_AUDIO_BYTES) {
        return safetyOnly("The recording is empty or exceeds the 10 MB limit.", 413);
      }
      if (!ALLOWED_AUDIO_TYPES.has(mimeType)) {
        return safetyOnly("That audio format is not supported. Please re-record in the browser.", 415);
      }
    }

    const textAssessment = textFallback
      ? buildDeterministicTextAssessment(textFallback, mode, language)
      : null;

    // Never wait for AI when typed accessibility input already contains an
    // acute deterministic red flag.
    let assessment: SafetyAssessment;
    if (textAssessment && textAssessment.reportedRedFlags.length > 0) {
      assessment = textAssessment;
    } else if (audioFile) {
      try {
        const buffer = Buffer.from(await audioFile.arrayBuffer());
        assessment = await analyzeSituationAudio(
          buffer,
          normalizeMimeType(audioFile.type),
          mode,
          language
        );
      } catch (error: unknown) {
        logServerError("Gemini safety analysis failed", error);
        return safetyOnly(
          "Personalized analysis is temporarily unavailable. Verified safety actions remain available."
        );
      }
    } else {
      assessment = textAssessment as SafetyAssessment;
    }

    const safetyEval = evaluateSafetyPath(
      assessment,
      textFallback ? { textFallback } : undefined
    );

    if (
      safetyEval.finalUrgency === "emergency" ||
      assessment.missingCriticalQuestion
    ) {
      return NextResponse.json({
        assessment,
        safetyEval,
        intervention: null,
        isSafetyOnlyMode: false
      });
    }

    return completeAssessment(assessment);
  } catch (error: unknown) {
    logServerError("Unhandled /api/analyse-situation error", error);
    return safetyOnly("The report could not be processed. Safety mode is active.", 500);
  }
}
