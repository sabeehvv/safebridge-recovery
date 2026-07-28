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

export const CriticalQuestionIdSchema = z.enum([
  "isResponsive",
  "breathing",
  "selfHarm",
  "violence"
]);

export const ResourceIdSchema = z.enum([
  "erss_112",
  "nmba_14446",
  "telemanas_14416",
  "tobacco_1800112356"
]);

export const SafetyAssessmentSchema = z.object({
  transcript: z.string().trim().min(1).max(10_000),
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
    reason: z.string().trim().min(1).max(1_000),
    confidence: z.number().min(0).max(1)
  }),

  missingCriticalQuestion: z.object({
    id: CriticalQuestionIdSchema,
    question: z.string().trim().min(1).max(300),
    options: z.array(z.enum(["yes", "no", "unsure"])).length(3)
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
  resourceIds: z.array(ResourceIdSchema).max(4),
  disclaimer: z.string().trim().min(1).max(500)
});

export type Intervention = z.infer<typeof InterventionSchema>;

export const AnalyzeSituationResponseSchema = z.discriminatedUnion("isSafetyOnlyMode", [
  z.object({
    isSafetyOnlyMode: z.literal(false),
    assessment: SafetyAssessmentSchema,
    safetyEval: z.object({
      finalUrgency: UrgencyLevelSchema,
      isEmergencyOverride: z.boolean(),
      overrideReason: z.string().optional(),
      mustCall112: z.boolean()
    }),
    intervention: InterventionSchema.nullable()
  }),
  z.object({
    isSafetyOnlyMode: z.literal(true),
    errorReason: z.string().optional()
  }).passthrough()
]);
export type AnalyzeSituationResponse = z.infer<typeof AnalyzeSituationResponseSchema>;

export const ClarificationAnswerSchema = z.enum(["yes", "no", "unsure"]);

export const ClarificationAnswersSchema = z.object({
  isResponsive: ClarificationAnswerSchema.optional(),
  breathing: ClarificationAnswerSchema.optional(),
  selfHarm: ClarificationAnswerSchema.optional(),
  violence: ClarificationAnswerSchema.optional()
}).strict();

export const ClarificationRequestSchema = z.object({
  assessment: SafetyAssessmentSchema,
  answers: ClarificationAnswersSchema
});
