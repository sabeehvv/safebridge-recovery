import { Intervention } from "./schemas";

export const HELPLINE_NUMBERS = {
  EMERGENCY: "112",
  NASHA_MUKT_BHARAT: "14446",
  TELE_MANAS: "14416",
  TOBACCO_QUITLINE: "1800-112-356"
} as const;

export const DEFAULT_FALLBACK_INTERVENTION: Intervention = {
  urgency: "guided_support",
  immediateScript:
    "Take a slow, deep breath. Focus on your immediate safety right now. You are safe, and verified support is available.",
  immediateAction: {
    title: "Grounding & Safety Pause",
    instruction:
      "Sit comfortably in a safe space. Sip a glass of water slowly and focus on 5 things you can see around you.",
    durationMinutes: 10
  },
  trustedContactMessage:
    "I am reaching out because I need some support right now. Could you please check in on me or stay on the line?",
  caregiverScript: {
    sayThis: [
      "I am here with you and you are safe right now.",
      "We can take this step by step together.",
      "Let's focus on getting quiet, calm rest right now."
    ],
    avoidThis: [
      "Do not blame or express disappointment.",
      "Avoid arguing about past actions right now.",
      "Do not leave the person isolated if they are distressed."
    ],
    checkNow: [
      "Check if breathing is clear and regular.",
      "Ensure surroundings are free of hazards or substances.",
      "Keep emergency helpline numbers (112, 14446) ready."
    ]
  },
  relapseMap: {
    eventBeforeUse: "High emotional stress or unexpected crisis trigger",
    emotionalTrigger: "Overwhelming anxiety or shame",
    environmentalTrigger: "Isolated environment with accessible trigger items",
    underlyingNeed: "Need for emotional relief and supportive connection",
    preventionUpdate:
      "Create a safe space and reach out to a trusted contact when feelings of anxiety escalate."
  },
  nextThirtyMinutes: [
    "Stay in a comfortable, quiet room.",
    "Sip water slowly and practice 4-7-8 breathing.",
    "Reach out to a trusted friend or helpline if distress continues."
  ],
  tomorrowAction:
    "Connect with a counselor, support group, or healthcare professional to discuss ongoing recovery goals.",
  resourceIds: ["erss_112", "nmba_14446", "telemanas_14416", "tobacco_1800112356"],
  disclaimer:
    "SafeBridge provides recovery support tools. It does not replace emergency or clinical care."
};

export const MALAYALAM_TRANSLATIONS: Record<string, string> = {
  // App branding & layout
  appName: "SafeBridge",
  appTagline: "മൾട്ടിമോഡൽ വീണ്ടെടുക്കൽ സഹായവും അടിയന്തര പ്രതിരോധ എൻജിനും",
  emergencyBypass: "പ്രതികരണമില്ലെങ്കിൽ അടിയന്തര ഘട്ടം — നേരിട്ടുള്ള സഹായം",
  erssFooter:
    "സംയോജിത ERSS ഹെൽപ്പ് ലൈൻ: 112 • നഷാ മുക്ത് ഭാരത്: 14446 • ടെലി-മാനസ്: 14416",

  // Modes & language
  selectLanguage: "ഭാഷ തിരഞ്ഞെടുക്കുക:",
  modeCravingTitle: "ലഹരി ഉപയോഗിക്കാൻ തോന്നുന്നു",
  modeCravingDesc: "ശക്തമായ ആഗ്രഹം അല്ലെങ്കിൽ പേടി അനുഭവപ്പെടുമ്പോൾ.",
  modeRelapseTitle: "ഞാൻ ലഹരി ഉപയോഗിച്ചു പോയി",
  modeRelapseDesc: "കുറ്റബോധമില്ലാതെ സുരക്ഷിതമായ അടുത്ത ഘട്ടങ്ങൾ.",
  modeCaregiverTitle: "മറ്റൊരാളെക്കുറിച്ച് വേവലാതിയുണ്ട്",
  modeCaregiverDesc: "എന്തു പറയണം, എന്തു ചെയ്യണം എന്നറിയാൻ.",
  active: "സജീവം",

  // Voice recorder
  speakHeader: "നിങ്ങളുടെ ശബ്ദത്തിൽ സംസാരിക്കുക",
  speakSub: "ടൈപ്പ് ചെയ്യേണ്ടതില്ല. നിങ്ങളുടെ ആശങ്കയോ സാഹചര്യമോ പകർത്തി പറയുക.",
  startRecording: "ശബ്ദം റെക്കോർഡ് ചെയ്യാൻ ടാപ്പ് ചെയ്യുക",
  stopRecording: "റെക്കോർഡിംഗ് നിർത്തുക",
  recordingActive: "റെക്കോർഡിംഗ് നടക്കുന്നു",
  tapToStop: "അവസാനിപ്പിക്കാൻ ടാപ്പ് ചെയ്യുക",
  recordingReady: "റെക്കോർഡിംഗ് തയ്യാറാണ്",
  deleteReRecord: "ഡിലീറ്റ് ചെയ്തു വീണ്ടും റെക്കോർഡ് ചെയ്യുക",
  analyzeButton: "വിശകലനത്തിനായി അയക്കുക",
  analyzingText: "ജെമിനി ഉപയോഗിച്ച് സാഹചര്യം വിശകലനം ചെയ്യുന്നു...",
  textFallbackToggle: "ടെക്സ്റ്റ് റിപ്പോർട്ട് ഉപയോഗിക്കുക (ലഭ്യതാ ഓപ്ഷൻ)",
  hideTextFallback: "ടെക്സ്റ്റ് ഇൻപുട്ട് മറയ്ക്കുക",
  textFallbackPlaceholder: "മൈക്രോഫോൺ ലഭ്യമല്ലെങ്കിൽ സാഹചര്യം ഇവിടെ വിവരിക്കുക...",
  submitTextReport: "ടെക്സ്റ്റ് റിപ്പോർട്ട് സമർപ്പിക്കുക",
  micPermissionError:
    "മൈക്രോഫോൺ അനുമതി ലഭിച്ചില്ല. ദയവായി ക്രമീകരണങ്ങൾ പരിശോധിക്കുക അല്ലെങ്കിൽ താഴെ ടൈപ്പ് ചെയ്യുക.",
  privacyTitle: "സ്വകാര്യത വാഗ്ദാനം",
  privacyDesc:
    "ശബ്ദ സന്ദേശങ്ങൾ സുരക്ഷ വിലയിരുത്തലിനായി താൽക്കാലികമായി മാത്രമാണ് പ്രോസസ്സ് ചെയ്യുന്നത്. സ്ഥിരമായി സൂക്ഷിക്കുന്നില്ല.",

  // Safety Bridge (Screen 2)
  screen2Title: "സുരക്ഷാ വീക്ഷണം",
  screen2Subtitle: "Screen 2 of 3",
  voiceTranscriptSummary: "ശബ്ദ സംഗ്രഹം:",
  statusAlone: "ഒറ്റയ്ക്ക്",
  statusWithOthers: "മറ്റുള്ളവരോടൊപ്പം",
  oneCriticalSafetyClarification: "ഒരു സുപ്രധാന സുരക്ഷാ സ്ഥിരീകരണം ആവശ്യമാണ്",
  proceedToHandover: "വീണ്ടെടുക്കൽ പ്ലാനിലേക്ക് പോകുക",
  safetyConfirmedMessage:
    "സുരക്ഷാ സാഹചര്യം ഉറപ്പാക്കി. വ്യക്തിഗത വീണ്ടെടുക്കൽ പ്ലാൻ തയ്യാറാണ്.",
  yes: "അതെ",
  no: "ഇല്ല",
  unsure: "ഉറപ്പില്ല",

  // Recovery Handover (Screen 3)
  screen3Subtitle: "Screen 3 of 3",
  caregiverActionPlan: "പരിപാലക മാർഗ്ഗരേഖ",
  recoveryPreventionPlan: "വീണ്ടെടുക്കൽ & പ്രതിരോധ പ്ലാൻ",
  startNewReport: "പുതിയ റിപ്പോർട്ട് തുടങ്ങുക",
  immediateActionHeading: "ഉടനടിയുള്ള നടപടിയും അടുത്ത 30 മിനിറ്റും",
  next30MinutesProtocol: "അടുത്ത 30 മിനിറ്റ് പ്രോട്ടോക്കോൾ:",
  relapseMapHeading: "കുറ്റപ്പെടുത്തലില്ലാത്ത ട്രിഗർ മാപ്പും പ്രതിരോധ കുറിപ്പുകളും",
  eventBeforeSituation: "സാഹചര്യത്തിന് മുമ്പുള്ള സംഭവം:",
  emotionalTrigger: "വൈകാരിക പ്രേരണ:",
  environmentalTrigger: "ചുറ്റുപാടിലെ പ്രേരണ:",
  underlyingNeed: "ആന്തരിക ആവശ്യം:",
  preventionNote: "പ്രതിരോധ കുറിപ്പ്:",
  tomorrowHandoverStep: "നാളത്തെ വീണ്ടെടുക്കൽ കൈമാറ്റ ഘട്ടം",
  searchHospitalMaps: "അടുത്തുള്ള ആശുപത്രി തിരയുക (Maps)",
  saveSafetyCard: "സുരക്ഷാ കാർഡ് സൂക്ഷിക്കുക",
  disclaimerText:
    "SafeBridge വീണ്ടെടുക്കൽ സഹായ ഉപകരണങ്ങൾ നൽകുന്നു. ഇത് അടിയന്തര വൈദ്യസഹായത്തിന് പകരമല്ല.",

  // Caregiver script & Emergency card
  caregiverScriptTitle: "പരിപാലക മാർഗ്ഗരേഖയും ആശയവിനിമയ സ്ക്രിപ്റ്റും",
  whatToSayNow: "ഇപ്പോൾ പറയേണ്ട കാര്യങ്ങൾ",
  whatToAvoidSaying: "ഒഴിവാക്കേണ്ട കാര്യങ്ങൾ",
  immediateSafetyChecks: "പരിപാലകൻ ഉടൻ പരിശോധിക്കേണ്ടവ:",
  readScriptAloud: "സ്ക്രിപ്റ്റ് ഉറക്കെ വായിക്കുക",
  pauseScript: "നിർത്തുക",
  emergencyEscalationTitle: "അടിയന്തര ഘട്ട മുന്നറിയിപ്പ് & അടിയന്തര ഫോൺ കോൾ",
  emergencyEscalationGuidance:
    "വ്യക്തിക്ക് ബോധക്ഷയമോ ശ്വാസതടസ്സമോ അപസ്മാരമോ ഉണ്ടായാൽ ഉടൻ 112 ലേക്ക് വിളിക്കുക.",
  call112EmergencyButton: "112 അടിയന്തര നമ്പറിലേക്ക് വിളിക്കുക",

  // Spoken intervention
  spokenInterventionTitle: "ഉടനടിയുള്ള ശബ്ദ നിർദ്ദേശം",
  readAloud: "ഉറക്കെ വായിക്കുക",
  pauseSpeech: "നിർത്തുക",
  ttsNotSupportedBanner:
    "ഈ ബ്രൗസറിൽ ശബ്ദ സംപ്രേക്ഷണം (Speech Synthesis API) ലഭ്യമല്ല. ദയവായി താഴെയുള്ള നിർദ്ദേശങ്ങൾ വായിക്കുക.",
  voiceNotFoundMsg:
    "തിരഞ്ഞെടുത്ത ഭാഷയ്ക്കുള്ള ശബ്ദം ലഭ്യമല്ല. ദയവായി മുകളിലുള്ള ടെക്സ്റ്റ് വായിക്കുക.",

  // Trusted contact action
  trustedContactTitle: "വിശ്വസ്ത വ്യക്തിക്കുള്ള സഹായ സന്ദേശം",
  copyMessage: "സന്ദേശം കോപ്പി ചെയ്യുക",
  copiedToClipboard: "കോപ്പി ചെയ്തു!",
  shareMessage: "സന്ദേശം പങ്കുവെക്കുക",
  callTrustedContact: "ബന്ധപ്പെടുക",

  // Verified resources
  verifiedHelplinesTitle: "സ്ഥിരീകരിച്ച ഹെൽപ്പ് ലൈനുകൾ & സഹായ കേന്ദ്രങ്ങൾ",
  callHelplines: "വിളിക്കുക",
  verifiedOn: "സ്ഥിരീകരിച്ചത്:",

  // Safety-only mode
  safetyOnlyActive: "സേഫ്റ്റി-ഓൺലി മോഡ് സജീവം",
  call112Now: "112 നമ്പർ വിളിക്കുക (ERSS അടിയന്തരം)",
  groundingActionTitle: "ലളിതമായ 5-4-3-2-1 ഇന്ദ്രിയ ഗ്രൗണ്ടിംഗ് രീതി",
  tryAiAgain: "AI വിശകലനം വീണ്ടും ശ്രമിക്കുക",

  // Emergency Button Modal
  emergencyModalTitle: "അടിയന്തര സഹായം ഉടൻ വിളിക്കുക",
  call112Immediately: "112 ലേക്ക് ഉടൻ വിളിക്കുക",
  speakerphoneInstruction: "സഹായത്തിനായി സംസാരിക്കുമ്പോൾ ഫോൺ സ്പീക്കറിലാക്കുക.",
  recoveryPositionTitle: "റിക്കവറി പൊസിഷൻ ഘട്ടങ്ങൾ",
  closeEmergencyView: "അടിയന്തര വിൻഡോ അടയ്ക്കുക"
};

export function t(key: string, language: "en" | "ml" = "en", fallback?: string): string {
  if (language === "ml" && MALAYALAM_TRANSLATIONS[key]) {
    return MALAYALAM_TRANSLATIONS[key];
  }
  return fallback || key;
}
