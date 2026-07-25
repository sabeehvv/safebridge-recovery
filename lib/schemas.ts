import { z } from "zod";

export const SituationModeSchema = z.enum([
  "craving",
  "recent_substance_use",
  "caregiver_concern"
]);

export type SituationMode = z.infer<typeof SituationModeSchema>;

export const UrgencyLevelSchema = z.enum([
  "emergency",
  "urgent_human_support",
  "guided_support"
]);

export type UrgencyLevel = z.infer<typeof UrgencyLevelSchema>;

export const LanguageSchema = z.enum(["en", "ml"]);
export type Language = z.infer<typeof LanguageSchema>;

export const RedFlagSchema = z.enum([
  "unresponsive",
  "not_breathing_normally",
  "seizure",
  "severe_breathing_difficulty",
  "serious_injury",
  "immediate_self_harm_risk",
  "immediate_violence_risk"
]);

export type RedFlag = z.infer<typeof RedFlagSchema>;

export const SafetyAssessmentSchema = z.object({
  transcript: z.string(),
  language: LanguageSchema,
  mode: SituationModeSchema,

  person: z.object({
    isUser: z.boolean(),
    isAlone: z.boolean().nullable(),
    isResponsive: z.boolean().nullable(),
    breathingConcernReported: z.boolean().nullable(),
    recentUseReported: z.boolean().nullable(),
    immediateSelfHarmConcern: z.boolean().nullable(),
    immediateViolenceConcern: z.boolean().nullable()
  }),

  context: z.object({
    substanceCategory: z.enum([
      "alcohol",
      "opioid",
      "stimulant",
      "sedative",
      "cannabis",
      "tobacco",
      "multiple",
      "unknown",
      "not_disclosed"
    ]),
    triggeringSituation: z.string().nullable(),
    emotions: z.array(z.string()).max(5),
    locationContext: z.string().nullable(),
    trustedPersonAvailable: z.boolean().nullable()
  }),

  reportedRedFlags: z.array(RedFlagSchema),

  aiAssessment: z.object({
    suggestedUrgency: UrgencyLevelSchema,
    reason: z.string(),
    confidence: z.number().min(0).max(1)
  }),

  missingCriticalQuestion: z.object({
    id: z.string(),
    question: z.string(),
    options: z.array(z.enum(["yes", "no", "unsure"]))
  }).nullable(),

  requiresHumanReview: z.literal(true)
});

export type SafetyAssessment = z.infer<typeof SafetyAssessmentSchema>;

export const InterventionSchema = z.object({
  urgency: UrgencyLevelSchema,

  immediateScript: z.string().max(500),
  immediateAction: z.object({
    title: z.string(),
    instruction: z.string(),
    durationMinutes: z.number().nullable()
  }),

  trustedContactMessage: z.string().nullable(),

  caregiverScript: z.object({
    sayThis: z.array(z.string()).max(4),
    avoidThis: z.array(z.string()).max(4),
    checkNow: z.array(z.string()).max(5)
  }).nullable(),

  relapseMap: z.object({
    eventBeforeUse: z.string().nullable(),
    emotionalTrigger: z.string().nullable(),
    environmentalTrigger: z.string().nullable(),
    underlyingNeed: z.string().nullable(),
    preventionUpdate: z.string().nullable()
  }).nullable(),

  nextThirtyMinutes: z.array(z.string()).max(5),
  tomorrowAction: z.string().nullable(),
  resourceIds: z.array(z.string()),
  disclaimer: z.string()
});

export type Intervention = z.infer<typeof InterventionSchema>;
