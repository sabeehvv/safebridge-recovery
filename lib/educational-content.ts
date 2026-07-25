export type EducationalCard = {
  id: string;
  title: string;
  summary: string;
  sourceOrg: string;
  reviewDate: string;
};

export const EDUCATIONAL_CARDS: EducationalCard[] = [
  {
    id: "card_craving",
    title: "Navigating a Strong Craving",
    summary: "Cravings peak like waves and subside in 15-20 minutes. Change your immediate environment, ground your senses with cold water, and connect with a trusted person before acting on impulse.",
    sourceOrg: "National Institute on Drug Abuse (NIDA)",
    reviewDate: "2026-06-15"
  },
  {
    id: "card_caregiver_comm",
    title: "Caregiver Support Without Blame",
    summary: "Speak calmly using 'I' statements rather than accusation. Prioritize physical safety, validate emotional stress, and focus on immediate supportive steps rather than past actions.",
    sourceOrg: "Substance Abuse and Mental Health Services Administration (SAMHSA)",
    reviewDate: "2026-06-10"
  },
  {
    id: "card_relapse_reconnect",
    title: "Reconnecting After a Lapse",
    summary: "Substance use recurrence is a sign to adjust recovery strategies, not a moral failure. Reach out to medical or support contacts immediately to restore physical safety and routine.",
    sourceOrg: "World Health Organization (WHO)",
    reviewDate: "2026-05-20"
  },
  {
    id: "card_emergency_signs",
    title: "When Immediate Emergency Help is Needed",
    summary: "Call 112 immediately if someone is unresponsive, struggling to breathe, experiencing seizures, severely injured, or expressing active self-harm or violence. Place call on speaker.",
    sourceOrg: "Ministry of Health & Family Welfare (India)",
    reviewDate: "2026-07-01"
  }
];
