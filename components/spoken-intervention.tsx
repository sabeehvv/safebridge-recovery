"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Sparkles, AlertCircle } from "lucide-react";
import { Language } from "@/lib/schemas";

interface SpokenInterventionProps {
  script: string;
  language: Language;
}

export function SpokenIntervention({ script, language }: SpokenInterventionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [voiceNotFound, setVoiceNotFound] = useState(false);

  const isML = language === "ml";

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
    }
  }, []);

  const handleSpeak = () => {
    if (!isSupported || !script) return;

    window.speechSynthesis.cancel();

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = language === "ml" ? "ml-IN" : "en-US";
    utterance.rate = 0.9; // Calm, deliberate pace

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      setIsPlaying(false);
      setVoiceNotFound(true);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleStop = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-sky-950/80 to-slate-950 border border-sky-800/80 rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sky-400 font-extrabold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>{isML ? "ഉടനടിയുള്ള ശബ്ദ നിർദ്ദേശം" : "Immediate Spoken Intervention"}</span>
        </div>

        {isSupported && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeak}
              className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" /> {isML ? "നിർത്തുക" : "Pause Speech"}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> {isML ? "ഉറക്കെ വായിക്കുക" : "Read Aloud"}
                </>
              )}
            </button>
            {isPlaying && (
              <button
                onClick={handleStop}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                aria-label="Stop playback"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Explicit visual notice banner when Speech Synthesis API is unsupported on device */}
      {!isSupported && (
        <div className="bg-amber-950/80 border border-amber-800/80 p-3.5 rounded-2xl flex items-start gap-2.5 text-amber-200 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <div>
            <p className="font-bold">
              {isML
                ? "ഈ ഉപകരണത്തിലോ ബ്രൗസറിലോ വോയ്‌സ് റീഡർ (Speech Synthesis API) ലഭ്യമല്ല."
                : "Speech Synthesis API is not available on this device or browser."}
            </p>
            <p className="text-[11px] text-amber-300/90 mt-0.5">
              {isML
                ? "ദയവായി താഴെ നൽകിയിരിക്കുന്ന ശബ്ദ മാർഗ്ഗനിർദ്ദേശ ടെക്സ്റ്റ് നേരിട്ട് വായിക്കുക."
                : "Please read the spoken intervention text provided directly below."}
            </p>
          </div>
        </div>
      )}

      {/* Script Display */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-sky-900/60 shadow-inner">
        <p className="text-base md:text-lg text-sky-50 font-medium leading-relaxed">
          "{script}"
        </p>
      </div>

      {voiceNotFound && isSupported && (
        <p className="text-[11px] text-amber-400 italic">
          {isML
            ? "തിരഞ്ഞെടുത്ത ഭാഷയ്ക്കുള്ള ശബ്ദം ലഭ്യമല്ല. ദയവായി മുകളിലുള്ള ടെക്സ്റ്റ് വായിക്കുക."
            : "Native browser audio voice engine not found for selected language. Please read the intervention text above."}
        </p>
      )}
    </div>
  );
}
