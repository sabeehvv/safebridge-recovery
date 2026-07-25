import { GoogleGenAI, Type } from "@google/genai";
import { SafetyAssessmentSchema, SafetyAssessment, InterventionSchema, Intervention, SituationMode, Language } from "./schemas";
import { SAFETY_ANALYSIS_SYSTEM_PROMPT, INTERVENTION_SYSTEM_PROMPT } from "./prompts";

const apiKey = process.env.GEMINI_API_KEY || "";
const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const ai = new GoogleGenAI({ apiKey });

export async function analyzeSituationAudio(
  audioBuffer: Buffer,
  mimeType: string,
  mode: SituationMode,
  language: Language
): Promise<SafetyAssessment> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const base64Audio = audioBuffer.toString("base64");

  const prompt = `
Mode: ${mode}
Target Language: ${language}

Please analyze this recorded voice situation. Transcribe the spoken text accurately, assess risk indicators, and provide structured safety assessment according to the system prompt guidelines.
`;

  // Timeout promise
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Gemini API timeout after 8 seconds")), 8000)
  );

  const apiCall = ai.models.generateContent({
    model: modelName,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64Audio,
              mimeType: mimeType || "audio/webm"
            }
          },
          { text: prompt }
        ]
      }
    ],
    config: {
      systemInstruction: SAFETY_ANALYSIS_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transcript: { type: Type.STRING },
          language: { type: Type.STRING, enum: ["en", "ml"] },
          mode: { type: Type.STRING, enum: ["craving", "recent_substance_use", "caregiver_concern"] },
          person: {
            type: Type.OBJECT,
            properties: {
              isUser: { type: Type.BOOLEAN },
              isAlone: { type: Type.BOOLEAN, nullable: true },
              isResponsive: { type: Type.BOOLEAN, nullable: true },
              breathingConcernReported: { type: Type.BOOLEAN, nullable: true },
              recentUseReported: { type: Type.BOOLEAN, nullable: true },
              immediateSelfHarmConcern: { type: Type.BOOLEAN, nullable: true },
              immediateViolenceConcern: { type: Type.BOOLEAN, nullable: true }
            },
            required: ["isUser"]
          },
          context: {
            type: Type.OBJECT,
            properties: {
              substanceCategory: {
                type: Type.STRING,
                enum: [
                  "alcohol",
                  "opioid",
                  "stimulant",
                  "sedative",
                  "cannabis",
                  "tobacco",
                  "multiple",
                  "unknown",
                  "not_disclosed"
                ]
              },
              triggeringSituation: { type: Type.STRING, nullable: true },
              emotions: { type: Type.ARRAY, items: { type: Type.STRING } },
              locationContext: { type: Type.STRING, nullable: true },
              trustedPersonAvailable: { type: Type.BOOLEAN, nullable: true }
            },
            required: ["substanceCategory", "emotions"]
          },
          reportedRedFlags: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
              enum: [
                "unresponsive",
                "not_breathing_normally",
                "seizure",
                "severe_breathing_difficulty",
                "serious_injury",
                "immediate_self_harm_risk",
                "immediate_violence_risk"
              ]
            }
          },
          aiAssessment: {
            type: Type.OBJECT,
            properties: {
              suggestedUrgency: { type: Type.STRING, enum: ["emergency", "urgent_human_support", "guided_support"] },
              reason: { type: Type.STRING },
              confidence: { type: Type.NUMBER }
            },
            required: ["suggestedUrgency", "reason", "confidence"]
          },
          missingCriticalQuestion: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING, enum: ["yes", "no", "unsure"] } }
            },
            required: ["id", "question", "options"]
          },
          requiresHumanReview: { type: Type.BOOLEAN }
        },
        required: [
          "transcript",
          "language",
          "mode",
          "person",
          "context",
          "reportedRedFlags",
          "aiAssessment",
          "requiresHumanReview"
        ]
      }
    }
  });

  const response = await Promise.race([apiCall, timeoutPromise]);
  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  const rawJson = JSON.parse(text);
  const parsed = SafetyAssessmentSchema.parse(rawJson);
  return parsed;
}

export async function generateIntervention(
  assessment: SafetyAssessment,
  additionalAnswers?: Record<string, string>
): Promise<Intervention> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const prompt = `
Generate recovery intervention and personalized script for:
Mode: ${assessment.mode}
Language: ${assessment.language}
Transcript: "${assessment.transcript}"
Context: ${JSON.stringify(assessment.context)}
Person State: ${JSON.stringify(assessment.person)}
Additional User Clarifications: ${JSON.stringify(additionalAnswers || {})}
`;

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Gemini API timeout after 8 seconds")), 8000)
  );

  const apiCall = ai.models.generateContent({
    model: modelName,
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    config: {
      systemInstruction: INTERVENTION_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          urgency: { type: Type.STRING, enum: ["emergency", "urgent_human_support", "guided_support"] },
          immediateScript: { type: Type.STRING },
          immediateAction: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              instruction: { type: Type.STRING },
              durationMinutes: { type: Type.NUMBER, nullable: true }
            },
            required: ["title", "instruction"]
          },
          trustedContactMessage: { type: Type.STRING, nullable: true },
          caregiverScript: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
              sayThis: { type: Type.ARRAY, items: { type: Type.STRING } },
              avoidThis: { type: Type.ARRAY, items: { type: Type.STRING } },
              checkNow: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["sayThis", "avoidThis", "checkNow"]
          },
          relapseMap: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
              eventBeforeUse: { type: Type.STRING, nullable: true },
              emotionalTrigger: { type: Type.STRING, nullable: true },
              environmentalTrigger: { type: Type.STRING, nullable: true },
              underlyingNeed: { type: Type.STRING, nullable: true },
              preventionUpdate: { type: Type.STRING, nullable: true }
            }
          },
          nextThirtyMinutes: { type: Type.ARRAY, items: { type: Type.STRING } },
          tomorrowAction: { type: Type.STRING, nullable: true },
          resourceIds: { type: Type.ARRAY, items: { type: Type.STRING } },
          disclaimer: { type: Type.STRING }
        },
        required: [
          "urgency",
          "immediateScript",
          "immediateAction",
          "nextThirtyMinutes",
          "resourceIds",
          "disclaimer"
        ]
      }
    }
  });

  const response = await Promise.race([apiCall, timeoutPromise]);
  const text = response.text;
  if (!text) {
    throw new Error("Empty intervention response from Gemini");
  }

  const rawJson = JSON.parse(text);
  const parsed = InterventionSchema.parse(rawJson);
  return parsed;
}
