"use client";

import { AlertTriangle, HeartPulse, Phone, RotateCcw, Volume2 } from "lucide-react";
import { Language } from "@/lib/schemas";

interface EmergencyModeProps {
  language: Language;
  reason?: string;
  onReset: () => void;
}

export function EmergencyMode({ language, reason, onReset }: EmergencyModeProps) {
  const isML = language === "ml";

  return (
    <section
      aria-labelledby="emergency-heading"
      className="bg-red-950 border-2 border-red-500 rounded-3xl p-6 shadow-2xl space-y-5"
    >
      <div role="alert" className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="w-8 h-8 text-yellow-300 shrink-0" />
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-red-300">
            {isML ? "അടിയന്തര സുരക്ഷാ നിർദ്ദേശം" : "Emergency safety override"}
          </p>
          <h2 id="emergency-heading" className="text-3xl font-black text-white">
            {isML ? "ഇപ്പോൾ 112-ലേക്ക് വിളിക്കുക" : "Call 112 now"}
          </h2>
          {reason && <p className="mt-2 text-sm text-red-100">{reason}</p>}
        </div>
      </div>

      <a
        href="tel:112"
        className="w-full bg-red-600 hover:bg-red-500 text-white text-2xl font-black py-5 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-yellow-300"
        aria-label={isML ? "112 അടിയന്തര നമ്പറിലേക്ക് ഇപ്പോൾ വിളിക്കുക" : "Call emergency services on 112 now"}
      >
        <Phone aria-hidden="true" className="w-8 h-8" />
        {isML ? "112 വിളിക്കുക" : "CALL 112"}
      </a>

      <div className="bg-black/30 border border-red-800 rounded-2xl p-4 space-y-3 text-sm text-red-50">
        <p className="flex items-start gap-2">
          <Volume2 aria-hidden="true" className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
          <span>
            {isML
              ? "ഫോൺ സ്പീക്കറിൽ ഇടുക. 112 ഓപ്പറേറ്ററുടെ നിർദ്ദേശങ്ങൾ കൃത്യമായി പാലിക്കുക."
              : "Put the phone on speaker and follow the 112 operator’s instructions exactly."}
          </span>
        </p>
        <p className="flex items-start gap-2">
          <HeartPulse aria-hidden="true" className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
          <span>
            {isML
              ? "ശ്വാസം സാധാരണമല്ലെങ്കിൽ, ഓപ്പറേറ്റർ നിർദ്ദേശിക്കുന്നുവെങ്കിൽ CPR ആരംഭിക്കുക. സാധാരണ ശ്വാസമുണ്ടെങ്കിൽ മാത്രം വശത്തേക്ക് കിടത്തുക. വ്യക്തിയെ ഒറ്റയ്ക്കാക്കരുത്."
              : "If breathing is not normal, start CPR when the operator tells you. Use the recovery position only if the person is breathing normally. Do not leave them alone."}
          </span>
        </p>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mx-auto flex items-center gap-2 text-sm font-bold text-red-100 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <RotateCcw aria-hidden="true" className="w-4 h-4" />
        {isML ? "പുതിയ റിപ്പോർട്ട് ആരംഭിക്കുക" : "Start a new report"}
      </button>
    </section>
  );
}
