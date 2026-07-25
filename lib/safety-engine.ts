import { SafetyAssessment, RedFlag, UrgencyLevel } from "./schemas";

export interface DeterministicSafetyEvaluation {
  finalUrgency: UrgencyLevel;
  isEmergencyOverride: boolean;
  overrideReason?: string;
  mustCall112: boolean;
}

const CRITICAL_RED_FLAGS: RedFlag[] = [
  "unresponsive",
  "not_breathing_normally",
  "seizure",
  "severe_breathing_difficulty",
  "serious_injury",
  "immediate_self_harm_risk",
  "immediate_violence_risk"
];

const RED_FLAG_KEYWORD_MAP: Record<RedFlag, string[]> = {
  unresponsive: [
    "unresponsive", "unconscious", "not waking up", "won't wake up", "wont wake up",
    "passed out", "fainted", "no response", "not responding", "doesnt respond", "doesn't respond",
    "ബോധമില്ല", "വിളിച്ചാൽ പ്രതികരണമില്ല", "ഉണരുന്നില്ല", "ബോധക്ഷയം", "പ്രതികരണമില്ല"
  ],
  not_breathing_normally: [
    "not breathing", "stopped breathing", "gasping", "choking", "no breath", "not breathing normally",
    "ശ്വാസമെടുക്കുന്നില്ല", "ശ്വാസം പോകുന്നില്ല", "ശ്വാസമില്ല"
  ],
  severe_breathing_difficulty: [
    "can't breathe", "cant breathe", "breathless", "struggling to breathe", "severe breathing",
    "shortness of breath", "hard to breathe", "difficulty breathing",
    "ശ്വാസതടസ്സം", "ശ്വാസം കിട്ടുന്നില്ല"
  ],
  seizure: [
    "seizure", "convulsion", "fits", "shaking uncontrollably", "shaking violent", "having a fit",
    "ഫിറ്റ്സ്", "അപസ്മാരം"
  ],
  serious_injury: [
    "serious injury", "bleeding heavily", "head trauma", "unconscious injury",
    "ഗുരുതര പരിക്ക്", "രക്തസ്രാവം"
  ],
  immediate_self_harm_risk: [
    "suicide", "kill myself", "want to die", "overdose", "end my life", "cutting",
    "self harm", "self-harm", "harming myself",
    "ആത്മഹത്യ", "ജീവനൊടുക്കുക", "സ്വയം ഉപദ്രവിക്കുക"
  ],
  immediate_violence_risk: [
    "attack", "kill someone", "knife", "weapon", "harm others", "violence",
    "threatening to kill", "shoot",
    "ആക്രമണം", "അക്രമം", "മറ്റുള്ളവരെ ഉപദ്രവിക്കുക"
  ]
};

/**
 * Extracts acute safety red flags from text transcript using English and Malayalam keywords.
 */
export function extractRedFlagsFromText(transcriptText: string): RedFlag[] {
  if (!transcriptText) return [];
  const normalizedText = transcriptText.toLowerCase();
  const detectedFlags: RedFlag[] = [];

  for (const [flag, keywords] of Object.entries(RED_FLAG_KEYWORD_MAP) as [RedFlag, string[]][]) {
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        detectedFlags.push(flag);
        break; // Match found for this red flag, move to next flag type
      }
    }
  }

  return detectedFlags;
}

/**
 * Deterministic safety engine enforcing non-negotiable emergency rules.
 * Gemini can escalate a case, but CANNOT downgrade a deterministic emergency.
 */
export function evaluateSafetyPath(
  assessment: SafetyAssessment,
  additionalAnswers?: Record<string, string>
): DeterministicSafetyEvaluation {
  const flags = new Set<RedFlag>(assessment.reportedRedFlags || []);

  // Extract red flags from transcript text using deterministic rule matching
  if (assessment.transcript) {
    const textFlags = extractRedFlagsFromText(assessment.transcript);
    textFlags.forEach(flag => flags.add(flag));
  }

  // Check additional user answers if clarified on Safety Bridge
  if (additionalAnswers) {
    if (additionalAnswers.isResponsive === "no") flags.add("unresponsive");
    if (additionalAnswers.breathing === "no") flags.add("not_breathing_normally");
    if (additionalAnswers.selfHarm === "yes") flags.add("immediate_self_harm_risk");
    if (additionalAnswers.violence === "yes") flags.add("immediate_violence_risk");

    Object.values(additionalAnswers).forEach(val => {
      if (typeof val === "string") {
        extractRedFlagsFromText(val).forEach(flag => flags.add(flag));
      }
    });
  }

  // Check person flags from assessment
  if (assessment.person.isResponsive === false) flags.add("unresponsive");
  if (assessment.person.breathingConcernReported === true) flags.add("not_breathing_normally");
  if (assessment.person.immediateSelfHarmConcern === true) flags.add("immediate_self_harm_risk");
  if (assessment.person.immediateViolenceConcern === true) flags.add("immediate_violence_risk");

  const detectedCriticalFlags = CRITICAL_RED_FLAGS.filter(flag => flags.has(flag));

  if (detectedCriticalFlags.length > 0) {
    return {
      finalUrgency: "emergency",
      isEmergencyOverride: true,
      overrideReason: `Critical safety red flags detected: ${detectedCriticalFlags.join(", ").replace(/_/g, " ")}. Direct emergency action required.`,
      mustCall112: true
    };
  }

  // If Gemini suggested emergency, honor it
  if (assessment.aiAssessment.suggestedUrgency === "emergency") {
    return {
      finalUrgency: "emergency",
      isEmergencyOverride: false,
      overrideReason: assessment.aiAssessment.reason,
      mustCall112: true
    };
  }

  // If user reported recent substance use or urgent help needed
  if (assessment.person.recentUseReported || assessment.aiAssessment.suggestedUrgency === "urgent_human_support") {
    return {
      finalUrgency: "urgent_human_support",
      isEmergencyOverride: false,
      mustCall112: false
    };
  }

  return {
    finalUrgency: "guided_support",
    isEmergencyOverride: false,
    mustCall112: false
  };
}
