export type VerifiedResource = {
  id: string;
  name: string;
  nameMl?: string;
  provider: string;
  providerMl?: string;
  purpose: string;
  purposeMl?: string;
  phone: string;
  sourceUrl: string;
  supportedSituations: string[];
  lastVerified: string;
};

export const VERIFIED_RESOURCES: VerifiedResource[] = [
  {
    id: "erss_112",
    name: "National Emergency Response Support System",
    nameMl: "ദേശീയ അടിയന്തര പ്രതികരണ പിന്തുണാ സംവിധാനം (ERSS 112)",
    provider: "Government of India - ERSS",
    providerMl: "ഇന്ത്യൻ സർക്കാർ - ERSS",
    purpose: "Immediate emergency medical and life safety response",
    purposeMl: "അടിയന്തര വൈദ്യസഹായവും ജീവൻ രക്ഷാ പ്രതികരണവും",
    phone: "112",
    sourceUrl: "https://112.gov.in/",
    supportedSituations: ["unresponsive", "breathing_issue", "overdose", "immediate_danger"],
    lastVerified: "2026-07-25"
  },
  {
    id: "nmba_14446",
    name: "Drug De-addiction Helpline",
    nameMl: "ലഹരി മോചന ദേശീയ ഹെൽപ്പ് ലൈൻ (14446)",
    provider: "Nasha Mukt Bharat Abhiyaan (MoSJE)",
    providerMl: "നഷാ മുക്ത് ഭാരത് അഭിയാൻ (MoSJE)",
    purpose: "Substance use disorder counselling, guidance, and treatment referral",
    purposeMl: "ലഹരി മുക്തി കൗൺസിലിംഗും ചികിത്സാ മാർഗ്ഗനിർദ്ദേശവും",
    phone: "14446",
    sourceUrl: "https://nmba.dosje.gov.in",
    supportedSituations: ["craving", "recent_substance_use", "treatment_guidance"],
    lastVerified: "2026-07-25"
  },
  {
    id: "telemanas_14416",
    name: "Tele-MANAS Mental Health Helpline",
    nameMl: "ടെലി-മാനസ് മാനസികാരോഗ്യ ഹെൽപ്പ് ലൈൻ (14416)",
    provider: "Ministry of Health & Family Welfare",
    providerMl: "ആരോഗ്യ കുടുംബക്ഷേമ മന്ത്രാലയം",
    purpose: "24/7 tele-mental health services and emotional crisis intervention",
    purposeMl: "24/7 മാനസികാരോഗ്യ കൗൺസിലിംഗും വൈകാരിക പിന്തുണയും",
    phone: "14416",
    sourceUrl: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2245967&lang=1",
    supportedSituations: ["emotional_crisis", "relapse_shame", "caregiver_stress"],
    lastVerified: "2026-07-25"
  },
  {
    id: "tobacco_1800112356",
    name: "National Tobacco Quitline Services",
    nameMl: "ദേശീയ പുകയില മുക്തി ഹെൽപ്പ് ലൈൻ (1800-112-356)",
    provider: "National Tobacco Control Programme",
    providerMl: "ദേശീയ പുകയില നിയന്ത്രണ പദ്ധതി",
    purpose: "Nicotine and tobacco cessation counselling and support",
    purposeMl: "പുകയില നിർത്താനുള്ള കൗൺസിലിംഗും പിന്തുണയും",
    phone: "1800-112-356",
    sourceUrl: "https://ntcp.mohfw.gov.in",
    supportedSituations: ["nicotine_craving", "tobacco_cessation"],
    lastVerified: "2026-07-25"
  }
];

export function getResourceById(id: string): VerifiedResource | undefined {
  return VERIFIED_RESOURCES.find(r => r.id === id);
}

export function getLocalizedResource(
  resource: VerifiedResource,
  language: "en" | "ml"
): { name: string; provider: string; purpose: string } {
  if (language === "ml") {
    return {
      name: resource.nameMl || resource.name,
      provider: resource.providerMl || resource.provider,
      purpose: resource.purposeMl || resource.purpose
    };
  }
  return {
    name: resource.name,
    provider: resource.provider,
    purpose: resource.purpose
  };
}
