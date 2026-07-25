import { NextRequest, NextResponse } from "next/server";
import { analyzeSituationAudio, generateIntervention } from "@/lib/gemini";
import { evaluateSafetyPath, extractRedFlagsFromText } from "@/lib/safety-engine";
import { SituationMode, Language, SafetyAssessment } from "@/lib/schemas";
import { VERIFIED_RESOURCES } from "@/lib/resources";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const mode = (formData.get("mode") as SituationMode) || "recent_substance_use";
    const language = (formData.get("language") as Language) || "en";
    const textFallback = formData.get("textFallback") as string | null;

    if (!audioFile && !textFallback) {
      return NextResponse.json(
        { error: "Audio file or text fallback is required." },
        { status: 400 }
      );
    }

    // Limit audio file size to 10MB max if provided
    if (audioFile && audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Audio file exceeds maximum size limit (10MB)." },
        { status: 400 }
      );
    }

    let assessment: SafetyAssessment | null = null;

    // Check immediate deterministic red flags in text fallback before calling AI
    const fallbackRedFlags = textFallback ? extractRedFlagsFromText(textFallback) : [];

    // Step 1: Call Gemini for audio analysis & structured extraction if audio provided
    if (audioFile) {
      try {
        const bytes = await audioFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        assessment = await analyzeSituationAudio(buffer, audioFile.type || "audio/webm", mode, language);
      } catch (geminiError: any) {
        console.error("Gemini analysis error:", geminiError);

        // If fallback text contains acute red flags, trigger emergency assessment directly
        if (fallbackRedFlags.length > 0) {
          assessment = {
            transcript: textFallback || "Emergency reported via text fallback",
            language,
            mode,
            person: {
              isUser: true,
              isAlone: null,
              isResponsive: fallbackRedFlags.includes("unresponsive") ? false : null,
              breathingConcernReported: fallbackRedFlags.includes("not_breathing_normally") || fallbackRedFlags.includes("severe_breathing_difficulty") ? true : null,
              recentUseReported: null,
              immediateSelfHarmConcern: fallbackRedFlags.includes("immediate_self_harm_risk") ? true : null,
              immediateViolenceConcern: fallbackRedFlags.includes("immediate_violence_risk") ? true : null
            },
            context: {
              substanceCategory: "unknown",
              triggeringSituation: textFallback || null,
              emotions: ["fear"],
              locationContext: null,
              trustedPersonAvailable: null
            },
            reportedRedFlags: fallbackRedFlags,
            aiAssessment: {
              suggestedUrgency: "emergency",
              reason: "Deterministic safety red flags detected in text intake fallback.",
              confidence: 1.0
            },
            missingCriticalQuestion: null,
            requiresHumanReview: true
          };
        } else {
          // Return Safety-Only Mode payload if Gemini fails or times out
          return NextResponse.json({
            isSafetyOnlyMode: true,
            errorReason: geminiError?.message || "Personalized AI analysis is temporarily unavailable.",
            fallbackResources: VERIFIED_RESOURCES
          });
        }
      }
    } else if (textFallback) {
      // Direct text intake mode
      assessment = {
        transcript: textFallback,
        language,
        mode,
        person: {
          isUser: true,
          isAlone: null,
          isResponsive: fallbackRedFlags.includes("unresponsive") ? false : null,
          breathingConcernReported: fallbackRedFlags.includes("not_breathing_normally") || fallbackRedFlags.includes("severe_breathing_difficulty") ? true : null,
          recentUseReported: null,
          immediateSelfHarmConcern: fallbackRedFlags.includes("immediate_self_harm_risk") ? true : null,
          immediateViolenceConcern: fallbackRedFlags.includes("immediate_violence_risk") ? true : null
        },
        context: {
          substanceCategory: "unknown",
          triggeringSituation: textFallback,
          emotions: [],
          locationContext: null,
          trustedPersonAvailable: null
        },
        reportedRedFlags: fallbackRedFlags,
        aiAssessment: {
          suggestedUrgency: fallbackRedFlags.length > 0 ? "emergency" : "guided_support",
          reason: fallbackRedFlags.length > 0 ? "Acute red flags identified in text." : "Text intake processed.",
          confidence: 0.9
        },
        missingCriticalQuestion: null,
        requiresHumanReview: true
      };
    }

    if (!assessment) {
      return NextResponse.json({
        isSafetyOnlyMode: true,
        errorReason: "Failed to process intake data.",
        fallbackResources: VERIFIED_RESOURCES
      });
    }

    // Step 2: Evaluate Safety Path using Deterministic Safety Engine
    const additionalAnswers: Record<string, string> = {};
    if (textFallback) additionalAnswers.textFallback = textFallback;

    const safetyEval = evaluateSafetyPath(assessment, additionalAnswers);

    // Step 3: If emergency override triggered, skip intervention generation
    if (safetyEval.isEmergencyOverride || safetyEval.finalUrgency === "emergency") {
      return NextResponse.json({
        assessment,
        safetyEval,
        intervention: null,
        isSafetyOnlyMode: false
      });
    }

    // Step 4: Generate Personalized Intervention
    let intervention;
    try {
      intervention = await generateIntervention(assessment);
    } catch (genErr: any) {
      console.error("Gemini intervention generation error:", genErr);
      return NextResponse.json({
        assessment,
        safetyEval,
        intervention: null,
        isSafetyOnlyMode: true,
        errorReason: "Intervention script generation encountered an error."
      });
    }

    return NextResponse.json({
      assessment,
      safetyEval,
      intervention,
      isSafetyOnlyMode: false
    });
  } catch (error: any) {
    console.error("Unhandled error in /api/analyse-situation:", error);
    return NextResponse.json(
      {
        isSafetyOnlyMode: true,
        errorReason: "An unexpected system error occurred. Safety mode activated."
      },
      { status: 500 }
    );
  }
}
