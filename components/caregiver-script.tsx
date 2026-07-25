"use client";

import React, { useState } from "react";
import { MessageSquare, AlertOctagon, CheckCircle2, Play, Pause, HeartHandshake, Phone, AlertTriangle } from "lucide-react";
import { Language } from "@/lib/schemas";

interface CaregiverScriptProps {
  sayThis: string[];
  avoidThis: string[];
  checkNow: string[];
  language?: Language;
}

export function CaregiverScript({ sayThis, avoidThis, checkNow, language = "en" }: CaregiverScriptProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isML = language === "ml";

  const handleReadScript = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    const text = isML
      ? `പറയേണ്ട കാര്യങ്ങൾ: ${sayThis.join(". ")}. ഒഴിവാക്കേണ്ട കാര്യങ്ങൾ: ${avoidThis.join(". ")}`
      : `What to say: ${sayThis.join(". ")}. What to avoid: ${avoidThis.join(". ")}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "ml" ? "ml-IN" : "en-US";
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div className="bg-purple-950/40 border border-purple-800/60 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-purple-300 font-extrabold text-xs uppercase tracking-wider">
          <HeartHandshake className="w-5 h-5 text-purple-400" />
          <span>{isML ? "പരിപാലക മാർഗ്ഗരേഖയും ആശയവിനിമയ സ്ക്രിപ്റ്റും" : "Caregiver Guidance & Communication Script"}</span>
        </div>
        <button
          onClick={handleReadScript}
          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isPlaying ? (isML ? "നിർത്തുക" : "Pause") : (isML ? "സ്ക്രിപ്റ്റ് ഉറക്കെ വായിക്കുക" : "Read Script Aloud")}</span>
        </button>
      </div>

      {/* Inline Emergency Escalation Action Card */}
      <div className="bg-red-950/80 border-2 border-red-600/80 p-4.5 rounded-2xl space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-red-300 font-extrabold text-xs uppercase tracking-wide">
          <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
          <span>{isML ? "അടിയന്തര ഘട്ട മുന്നറിയിപ്പ് & അടിയന്തര ഫോൺ കോൾ" : "Emergency Escalation Warning"}</span>
        </div>
        <p className="text-xs text-red-200 leading-relaxed">
          {isML
            ? "വ്യക്തിക്ക് ബോധക്ഷയമോ ശ്വാസതടസ്സമോ അപസ്മാരമോ ഉണ്ടാവുകയോ അവസ്ഥ മോശമാവുകയോ ചെയ്താൽ ഉടൻ 112 നമ്പർ വിളിക്കുക."
            : "If the person becomes unresponsive, experiences severe breathing difficulty, seizures, or acute distress, initiate emergency escalation immediately."}
        </p>
        <a
          href="tel:112"
          className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-xs uppercase tracking-wider"
        >
          <Phone className="w-4 h-4" />
          <span>{isML ? "112 അടിയന്തര നമ്പറിലേക്ക് വിളിക്കുക" : "Call 112 Emergency Immediately"}</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What to Say */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-emerald-800/80 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>{isML ? "ഇപ്പോൾ പറയേണ്ട കാര്യങ്ങൾ" : "WHAT TO SAY NOW"}</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-200">
            {sayThis.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-900/40">
                <span className="font-bold text-emerald-400">•</span>
                <span>"{item}"</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What NOT to Say */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-rose-800/80 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertOctagon className="w-5 h-5" />
            <span>{isML ? "ഒഴിവാക്കേണ്ട കാര്യങ്ങൾ" : "WHAT TO AVOID SAYING"}</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-200">
            {avoidThis.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-rose-950/30 p-2.5 rounded-xl border border-rose-900/40">
                <span className="font-bold text-rose-400">•</span>
                <span>"{item}"</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Safety Checks */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-purple-800/60 space-y-2">
        <div className="text-xs font-bold text-purple-300 uppercase tracking-wide flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span>{isML ? "പരിപാലകൻ ഉടൻ പരിശോധിക്കേണ്ടവ:" : "Immediate Safety Checks for Caregiver:"}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
          {checkNow.map((check, idx) => (
            <div key={idx} className="bg-purple-950/30 p-2.5 rounded-xl border border-purple-900/40 text-purple-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>{check}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
