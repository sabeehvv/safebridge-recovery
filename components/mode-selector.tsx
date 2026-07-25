"use client";

import React from "react";
import { SituationMode, Language } from "@/lib/schemas";
import { Flame, ShieldAlert, HeartHandshake, Globe } from "lucide-react";

interface ModeSelectorProps {
  selectedMode: SituationMode;
  onSelectMode: (mode: SituationMode) => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
}

export function ModeSelector({
  selectedMode,
  onSelectMode,
  language,
  onSelectLanguage
}: ModeSelectorProps) {
  const isML = language === "ml";

  return (
    <div className="space-y-6">
      {/* Language Selector Header */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-3 px-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
          <Globe className="w-4 h-4 text-sky-400" />
          <span>{isML ? "ഭാഷ തിരെഞ്ഞെടുക്കുക:" : "Language:"}</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onSelectLanguage("en")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              language === "en"
                ? "bg-sky-500 text-white shadow-md"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            English
          </button>
          <button
            onClick={() => onSelectLanguage("ml")}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              language === "ml"
                ? "bg-sky-500 text-white shadow-md"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            മലയാളം
          </button>
        </div>
      </div>

      {/* 3 Primary Pathway Choices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Craving Rescue */}
        <button
          onClick={() => onSelectMode("craving")}
          className={`p-5 rounded-3xl border-2 text-left transition-all flex flex-col justify-between ${
            selectedMode === "craving"
              ? "bg-sky-950/80 border-sky-400 shadow-xl shadow-sky-950/50 ring-2 ring-sky-400"
              : "bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl">
                <Flame className="w-7 h-7" />
              </div>
              {selectedMode === "craving" && (
                <span className="text-xs bg-sky-400 text-slate-950 font-black px-2.5 py-1 rounded-full uppercase">
                  Active
                </span>
              )}
            </div>
            <h3 className="text-xl font-extrabold text-white mb-1">
              {isML ? "ലഹരി ഉപയോഗിക്കാൻ തോന്നുന്നു" : "I may use a substance"}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isML
                ? "ശക്തമായ ആഗ്രഹം അല്ലെങ്കിൽ പേടി അനുഭവപ്പെടുമ്പോൾ."
                : "Craving rescue & immediate 5-minute stabilization plan."}
            </p>
          </div>
        </button>

        {/* Relapse Without Shame */}
        <button
          onClick={() => onSelectMode("recent_substance_use")}
          className={`p-5 rounded-3xl border-2 text-left transition-all flex flex-col justify-between ${
            selectedMode === "recent_substance_use"
              ? "bg-sky-950/80 border-sky-400 shadow-xl shadow-sky-950/50 ring-2 ring-sky-400"
              : "bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                <ShieldAlert className="w-7 h-7" />
              </div>
              {selectedMode === "recent_substance_use" && (
                <span className="text-xs bg-sky-400 text-slate-950 font-black px-2.5 py-1 rounded-full uppercase">
                  Active
                </span>
              )}
            </div>
            <h3 className="text-xl font-extrabold text-white mb-1">
              {isML ? "ഞാൻ ലഹരി ഉപയോഗിച്ചു പോയി" : "I have already used a substance"}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isML
                ? "കുറ്റബോധമില്ലാതെ സുരക്ഷിതമായ അടുത്ത ഘട്ടങ്ങൾ."
                : "Non-judgmental safety check & next 30-minutes plan."}
            </p>
          </div>
        </button>

        {/* Caregiver Whisper */}
        <button
          onClick={() => onSelectMode("caregiver_concern")}
          className={`p-5 rounded-3xl border-2 text-left transition-all flex flex-col justify-between ${
            selectedMode === "caregiver_concern"
              ? "bg-sky-950/80 border-sky-400 shadow-xl shadow-sky-950/50 ring-2 ring-sky-400"
              : "bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl">
                <HeartHandshake className="w-7 h-7" />
              </div>
              {selectedMode === "caregiver_concern" && (
                <span className="text-xs bg-sky-400 text-slate-950 font-black px-2.5 py-1 rounded-full uppercase">
                  Active
                </span>
              )}
            </div>
            <h3 className="text-xl font-extrabold text-white mb-1">
              {isML ? "മറ്റൊരാളെക്കുറിച്ച് വേവലാതിയുണ്ട്" : "I'm worried about someone"}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isML
                ? "എന്തു പറയണം, എന്തു ചെയ്യണം എന്നറിയാൻ."
                : "What to say, what to avoid & immediate caregiver script."}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
