export const PRIVACY_DISCLOSURE = {
  title: "Data Privacy & Safety Guarantee",
  bulletPoints: [
    "No account or login required.",
    "Voice recordings are sent securely to the server and Google Gemini for the requested analysis.",
    "SafeBridge does not intentionally persist raw audio or transcripts in its own database.",
    "Saved Recovery Cards remain 100% local to your browser device storage.",
    "You can clear all saved local data at any time with one click."
  ]
};

export function clearAllLocalData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("safebridge_recovery_card");
  }
}
