"use client";

import React, { useState } from "react";
import { SafetyAssessment, Language } from "@/lib/schemas";
import { Shield, AlertCircle, HelpCircle, ArrowRight, UserCheck } from "lucide-react";

interface SafetyBridgeProps {
  assessment: SafetyAssessment;
  language: Language;
  onConfirmQuestion: (answers: Record<string, string>) => void;
  isSubmitting?: boolean;
}

export function SafetyBridge({
  assessment,
  language,
  onConfirmQuestion,
  isSubmitting = false
}: SafetyBridgeProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const isML = language === "ml";

  const question = assessment.missingCriticalQuestion;

  const handleOptionSelect = (optionValue: string) => {
    if (!question) return;
    const newAnswers = { ...answers, [question.id]: optionValue };
    setAnswers(newAnswers);
    onConfirmQuestion(newAnswers);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-sky-400">Screen 2 of 3</span>
          <h2 className="text-2xl font-black text-white">
            {isML ? "സുരക്ഷാ വീക്ഷണം" : "Safety Bridge Context"}
          </h2>
        </div>
      </div>

      {/* Transcript & Situation Overview */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
          {isML ? "ശബ്ദ സംഗ്രഹം:" : "Voice Transcript Summary:"}
        </div>
        <p className="text-sm italic text-slate-200 bg-slate-900 p-3 rounded-xl border border-slate-800/60">
          "{assessment.transcript || "No transcript generated."}"
        </p>

        <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2 text-slate-300">
            <UserCheck className="w-4 h-4 text-sky-400" />
            <span>
              <strong>Status:</strong>{" "}
              {assessment.person.isAlone === null
                ? "Not confirmed"
                : assessment.person.isAlone
                  ? "Alone"
                  : "With others"}
            </span>
          </div>
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2 text-slate-300">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>
              <strong>Substance:</strong> {assessment.context.substanceCategory.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {assessment.context.emotions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {assessment.context.emotions.map((emo, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium"
              >
                #{emo}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Critical Missing Safety Question (One at a time) */}
      {question ? (
        <div className="bg-amber-950/60 border-2 border-amber-500/80 p-5 rounded-2xl space-y-4 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wide">
            <HelpCircle className="w-5 h-5 animate-pulse" />
            <span>One Critical Safety Clarification Needed</span>
          </div>

          <h3 className="text-xl font-extrabold text-white leading-snug">
            {question.question}
          </h3>

          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2"
            role="group"
            aria-label={question.question}
          >
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleOptionSelect("yes")}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md transition-all active:scale-95 text-base"
            >
              {isML ? "അതെ" : "YES"}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleOptionSelect("no")}
              className="py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-md transition-all active:scale-95 text-base"
            >
              {isML ? "ഇല്ല" : "NO"}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleOptionSelect("unsure")}
              className="py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 text-base"
            >
              {isML ? "ഉറപ്പില്ല" : "NOT SURE"}
            </button>
          </div>
        </div>
      ) : (
        /* No questions remaining, proceed button */
        <div className="space-y-4 pt-2">
          <div className="bg-emerald-950/60 border border-emerald-800 p-4 rounded-2xl text-xs text-emerald-300 flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>Safety context confirmed. Ready to generate personalized recovery intervention.</span>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onConfirmQuestion(answers)}
            className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all text-lg"
          >
            <span>{isML ? "വീണ്ടെടുക്കൽ പ്ലാനിലേക്ക് പോകുക" : "Proceed to Recovery Handover"}</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
