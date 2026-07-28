"use client";

import React, { useState } from "react";
import {
  AnalyzeSituationResponseSchema,
  AnalyzeSituationResponse,
  SituationMode,
  Language,
  SafetyAssessment,
  Intervention
} from "@/lib/schemas";
import { DeterministicSafetyEvaluation, evaluateSafetyPath } from "@/lib/safety-engine";
import { HELPLINE_NUMBERS } from "@/lib/constants";
import { EmergencyButton } from "@/components/emergency-button";
import { ModeSelector } from "@/components/mode-selector";
import { VoiceRecorder } from "@/components/voice-recorder";
import { SafetyBridge } from "@/components/safety-bridge";
import { RecoveryHandover } from "@/components/recovery-handover";
import { SafetyOnlyMode } from "@/components/safety-only-mode";
import { EmergencyMode } from "@/components/emergency-mode";
import { Shield } from "lucide-react";

type Step = "INTAKE" | "SAFETY_BRIDGE" | "HANDOVER" | "EMERGENCY" | "SAFETY_ONLY";

async function requestAnalysis(init: RequestInit): Promise<AnalyzeSituationResponse> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch("/api/analyse-situation", {
      method: "POST",
      ...init,
      signal: controller.signal
    });
    const rawData: unknown = await response.json();
    const parsed = AnalyzeSituationResponseSchema.safeParse(rawData);
    if (!parsed.success) {
      throw new Error("The server returned an invalid safety response.");
    }
    return parsed.data;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export default function HomePage() {
  const [step, setStep] = useState<Step>("INTAKE");
  const [mode, setMode] = useState<SituationMode>("recent_substance_use");
  const [language, setLanguage] = useState<Language>("en");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [assessment, setAssessment] = useState<SafetyAssessment | null>(null);
  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [safetyEval, setSafetyEval] = useState<DeterministicSafetyEvaluation | null>(null);
  const [safetyOnlyReason, setSafetyOnlyReason] = useState<string | null>(null);

  const isML = language === "ml";

  const handleAudioSubmit = async (audioBlob: Blob | null, textFallback?: string) => {
    setIsAnalyzing(true);
    setSafetyOnlyReason(null);

    const formData = new FormData();
    if (audioBlob) {
      formData.append("audio", audioBlob, "user-recording");
    }
    formData.append("mode", mode);
    formData.append("language", language);
    if (textFallback) {
      formData.append("textFallback", textFallback);
    }

    try {
      const data = await requestAnalysis({ body: formData });

      if (data.isSafetyOnlyMode) {
        setSafetyOnlyReason(
          ("errorReason" in data && data.errorReason) ||
            "Personalized AI analysis is temporarily unavailable."
        );
        setStep("SAFETY_ONLY");
        setIsAnalyzing(false);
        return;
      }

      setAssessment(data.assessment);
      setSafetyEval(data.safetyEval);
      setIntervention(data.intervention);

      // If acute emergency red flags exist, force Safety Bridge / Emergency view immediately
      if (data.safetyEval.finalUrgency === "emergency") {
        setStep("EMERGENCY");
      } else if (data.assessment.missingCriticalQuestion) {
        setStep("SAFETY_BRIDGE");
      } else if (!data.intervention) {
        setSafetyOnlyReason("Personalized recovery guidance was unavailable.");
        setStep("SAFETY_ONLY");
      } else {
        setStep("HANDOVER");
      }
    } catch (error: unknown) {
      console.error("Submission error:", error);
      setSafetyOnlyReason(
        error instanceof DOMException && error.name === "AbortError"
          ? "The analysis timed out. Safety mode was activated."
          : "The analysis could not be completed. Safety mode was activated."
      );
      setStep("SAFETY_ONLY");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmBridgeQuestion = async (answers: Record<string, string>) => {
    if (!assessment) return;

    const updatedAssessment: SafetyAssessment = {
      ...assessment,
      missingCriticalQuestion: null
    };

    // Re-evaluate safety path with tap answers
    const updatedSafetyEval = evaluateSafetyPath(updatedAssessment, answers);

    setAssessment(updatedAssessment);
    setSafetyEval(updatedSafetyEval);

    if (updatedSafetyEval.finalUrgency === "emergency") {
      setStep("EMERGENCY");
      return;
    }

    setIsAnalyzing(true);
    try {
      const data = await requestAnalysis({
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assessment, answers })
      });
      if (data.isSafetyOnlyMode) {
        setSafetyOnlyReason(
          data.errorReason || "Personalized recovery guidance is unavailable."
        );
        setStep("SAFETY_ONLY");
        return;
      }

      setAssessment(data.assessment);
      setSafetyEval(data.safetyEval);
      setIntervention(data.intervention);
      if (data.safetyEval.finalUrgency === "emergency") {
        setStep("EMERGENCY");
      } else if (data.intervention) {
        setStep("HANDOVER");
      } else {
        setSafetyOnlyReason("Personalized recovery guidance was unavailable.");
        setStep("SAFETY_ONLY");
      }
    } catch (error: unknown) {
      console.error("Clarification submission error:", error);
      setSafetyOnlyReason("The clarification could not be processed. Safety mode was activated.");
      setStep("SAFETY_ONLY");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setStep("INTAKE");
    setAssessment(null);
    setIntervention(null);
    setSafetyEval(null);
    setSafetyOnlyReason(null);
  };

  return (
    <main lang={language} className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Brand Header */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-500/30">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              SafeBridge
              <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded-full font-bold uppercase">
                GenAI Platform
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {isML
                ? "മൾട്ടിമോഡൽ വീണ്ടെടുക്കൽ സഹായവും അടിയന്തര പ്രതിരോധ എൻജിനും"
                : "Multimodal Recovery Support & Emergency Prevention Engine"}
            </p>
          </div>
        </div>
      </header>

      {/* Permanent Emergency Bypass Button */}
      <EmergencyButton language={language} />

      {/* Dynamic Screen Flow */}
      {step === "INTAKE" && (
        <div className="space-y-6 animate-fade-in">
          <ModeSelector
            selectedMode={mode}
            onSelectMode={setMode}
            language={language}
            onSelectLanguage={setLanguage}
          />
          <VoiceRecorder
            language={language}
            onAudioSubmit={handleAudioSubmit}
            isAnalyzing={isAnalyzing}
          />
        </div>
      )}

      {step === "SAFETY_BRIDGE" && assessment && (
        <div className="animate-fade-in">
          <SafetyBridge
            assessment={assessment}
            language={language}
            onConfirmQuestion={handleConfirmBridgeQuestion}
            isSubmitting={isAnalyzing}
          />
        </div>
      )}

      {step === "HANDOVER" && assessment && intervention && (
        <div className="animate-fade-in">
          <RecoveryHandover
            assessment={assessment}
            intervention={intervention}
            language={language}
            onReset={handleReset}
          />
        </div>
      )}

      {step === "EMERGENCY" && (
        <EmergencyMode
          language={language}
          reason={safetyEval?.overrideReason}
          onReset={handleReset}
        />
      )}

      {step === "SAFETY_ONLY" && (
        <SafetyOnlyMode
          reason={safetyOnlyReason || undefined}
          onRetry={handleReset}
          language={language}
        />
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-900 space-y-1">
        <p>SafeBridge — GenAI Prevention & Recovery Platform</p>
        <p className="text-[11px] text-slate-400">
          {isML
            ? `സംയോജിത ERSS ഹെൽപ്പ് ലൈൻ: ${HELPLINE_NUMBERS.EMERGENCY} • നഷാ മുക്ത് ഭാരത്: ${HELPLINE_NUMBERS.NASHA_MUKT_BHARAT} • ടെലി-മാനസ്: ${HELPLINE_NUMBERS.TELE_MANAS}`
            : `Integrated ERSS Helpline: ${HELPLINE_NUMBERS.EMERGENCY} • Nasha Mukt Bharat: ${HELPLINE_NUMBERS.NASHA_MUKT_BHARAT} • Tele-MANAS: ${HELPLINE_NUMBERS.TELE_MANAS}`}
        </p>
      </footer>
    </main>
  );
}
