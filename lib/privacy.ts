export const PRIVACY_DISCLOSURE = {
  title: "Data Privacy & Safety Guarantee",
  bulletPoints: [
    "No account or login required.",
    "Raw audio is processed server-side in memory and deleted immediately after analysis.",
    "Transcripts and personal voice data are never permanently saved on servers.",
    "Saved Recovery Cards remain 100% local to your browser device storage.",
    "You can clear all saved local data at any time with one click."
  ]
};

export function clearAllLocalData(): void {
  if (typeof window !== "undefined") {
    localStorage.clear();
  }
}
