"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Phone, Volume2, Shield, X, Activity } from "lucide-react";
import { normalizePhoneNumber } from "@/lib/local-storage";
import { useSavedSafetyCard } from "@/lib/use-saved-safety-card";
import { Language } from "@/lib/schemas";

interface EmergencyButtonProps {
  language?: Language;
}

export function EmergencyButton({ language = "en" }: EmergencyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSafetyCard, setShowSafetyCard] = useState(false);
  const savedCard = useSavedSafetyCard();
  const isML = language === "ml";

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <a
        href="tel:112"
        onClick={() => setIsOpen(true)}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg border-2 border-red-400 flex items-center justify-center gap-3 transition-all transform active:scale-98 animate-pulse text-lg"
        aria-label={isML ? "അടിയന്തര ഘട്ടം: പ്രതികരണമില്ലാത്ത അവസ്ഥ" : "Emergency Bypass: Someone is not responding"}
      >
        <AlertTriangle className="w-7 h-7 text-yellow-300 flex-shrink-0" />
        <span className="text-left font-black tracking-wide">
          {isML
            ? "പ്രതികരണമില്ലെങ്കിൽ അടിയന്തര ഘട്ടം — നേരിട്ടുള്ള സഹായം"
            : "SOMEONE IS NOT RESPONDING — EMERGENCY BYPASS"}
        </span>
      </a>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="emergency-dialog-title"
            className="bg-red-950 border-2 border-red-500 text-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-5"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-red-300 hover:text-white p-2"
              aria-label="Close emergency modal"
            >
              <X className="w-7 h-7" />
            </button>

            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
              <span className="text-sm font-bold uppercase tracking-wider">
                {isML ? "ഉടനടിയുള്ള സുരക്ഷാ നടപടികൾ" : "Immediate Safety Protocol"}
              </span>
            </div>

            <h2 id="emergency-dialog-title" className="text-3xl font-extrabold text-white leading-tight">
              {isML ? "അടിയന്തര സേവനങ്ങൾ ഉടൻ വിളിക്കുക" : "Call Emergency Services Now"}
            </h2>

            {/* Direct Telephone Link and Speakerphone Instruction */}
            <div className="bg-red-900/60 border border-red-700 rounded-2xl p-5 space-y-4">
              <a
                href="tel:112"
                className="w-full bg-red-600 hover:bg-red-500 text-white text-2xl font-black py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-xl transition-all"
              >
                <Phone className="w-8 h-8 animate-bounce" />
                {isML ? "112 നമ്പർ ഉടൻ വിളിക്കുക" : "CALL 112 IMMEDIATELY"}
              </a>

              <div className="flex items-start gap-3 bg-red-950/80 p-3 rounded-lg border border-red-800 text-red-200 text-sm">
                <Volume2 className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>
                  {isML ? (
                    <>
                      <strong>ഫോൺ സ്പീക്കറിലാക്കുക</strong> - ആളെയ സഹായിക്കുന്നതിനൊപ്പം ഓപ്പറേറ്ററുടെ നിർദ്ദേശങ്ങൾ ശ്രദ്ധിക്കുക.
                    </>
                  ) : (
                    <>
                      <strong>Put call on SPEAKER</strong> so you can follow the operator's instructions while assisting the person.
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="bg-yellow-950/60 border border-yellow-600 rounded-2xl p-4 text-sm text-yellow-100">
              <strong>{isML ? "ശ്വാസം സാധാരണമല്ലെങ്കിൽ:" : "If breathing is not normal:"}</strong>{" "}
              {isML
                ? "112 ഓപ്പറേറ്റർ നിർദ്ദേശിക്കുന്നുവെങ്കിൽ ഉടൻ CPR ആരംഭിക്കുക. വ്യക്തിയെ റിക്കവറി പൊസിഷനിൽ ഇടരുത്."
                : "Start CPR immediately if the 112 operator instructs you. Do not place the person in the recovery position."}
            </div>

            {/* Recovery Position Step-by-Step Guide */}
            <div className="bg-red-900/40 border border-red-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-red-200 font-bold text-base">
                <Activity className="w-5 h-5 text-yellow-400" />
                <h3>{isML ? "സാധാരണ ശ്വാസമുണ്ടെങ്കിൽ മാത്രം: റിക്കവറി പൊസിഷൻ" : "Only if breathing normally: recovery position"}</h3>
              </div>
              <ol className="space-y-2 text-xs text-red-100 list-decimal list-inside leading-relaxed">
                <li>
                  <strong className="text-white">{isML ? "കൈ വെയ്ക്കുക:" : "Position arm:"}</strong> {isML ? "ആളുടെ വശത്ത് മുട്ടുകുത്തുക. നിങ്ങളുടെ അടുത്തുള്ള കൈ നേരെ നിവർത്തി മുകളിലേക്ക് തിരിച്ചു വെയ്ക്കുക." : "Kneel beside the person. Place the arm closest to you at a right angle to their body with elbow bent, palm facing up."}
                </li>
                <li>
                  <strong className="text-white">{isML ? "തല സംരക്ഷിക്കുക:" : "Support head:"}</strong> {isML ? "മറ്റേ കൈ നെഞ്ചിന് കുറുകെ വെച്ച് കൈപ്പത്തി അടുത്തുള്ള കവിളിൽ വെയ്ക്കുക." : "Bring their far arm across their chest and hold the back of their hand against the cheek closest to you."}
                </li>
                <li>
                  <strong className="text-white">{isML ? "വശത്തേക്ക് തിരിക്കുക:" : "Roll on side:"}</strong> {isML ? "അകലെയുള്ള കാൽ മുട്ടിൽ മടക്കി, നിങ്ങളുടെ ഭാഗത്തേക്ക് പതിയെ തിരിച്ചു വെയ്ക്കുക." : "Bend their far leg at the knee. Pull their knee toward you to gently roll them onto their side facing you."}
                </li>
                <li>
                  <strong className="text-white">{isML ? "ശ്വാസനാളം തുറക്കുക:" : "Open airway:"}</strong> {isML ? "തല ചെറുതായി പിന്നിലേക്ക് ഉയർത്തി ശ്വാസമെടുക്കാൻ തടസ്സമില്ലെന്ന് ഉറപ്പുവരുത്തുക." : "Tilt their head back gently and lift their chin to ensure the airway stays open and clear."}
                </li>
                <li>
                  <strong className="text-white">{isML ? "കൂടെ നിൽക്കുക:" : "Stay & Monitor:"}</strong> {isML ? "ഒറ്റയ്ക്ക് ഉപേക്ഷിക്കരുത്. 112 വരുന്നത് വരെ സ്പീക്കർ ഫോണിൽ തുടരുക." : "Do not leave them alone. Do not induce vomiting. Stay on speakerphone with 112 until responders arrive."}
                </li>
              </ol>
            </div>

            {/* Local Recovery Safety Card Integration */}
            {savedCard && (
              <div className="bg-red-900/40 p-4 rounded-xl border border-red-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-red-200">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span>{isML ? `സേവ് ചെയ്ത കാർഡ് ലഭ്യമാണ് (${savedCard.trustedContactName})` : `Saved Safety Card Available (${savedCard.trustedContactName})`}</span>
                </div>
                <button
                  onClick={() => setShowSafetyCard(!showSafetyCard)}
                  className="text-xs bg-red-800 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-lg"
                >
                  {showSafetyCard ? (isML ? "കാർഡ് മറയ്ക്കുക" : "Hide Card") : (isML ? "കാർഡ് കാണുക" : "View Card")}
                </button>
              </div>
            )}

            {showSafetyCard && savedCard && (
              <div className="bg-black/60 p-4 rounded-xl border border-red-700 text-xs space-y-2 text-red-200">
                <p><strong>{isML ? "വിശ്വസ്ത വ്യക്തി:" : "Trusted Person:"}</strong> {savedCard.trustedContactName} ({savedCard.trustedContactPhone})</p>
                <p><strong>{isML ? "മുന്നറിയിപ്പ് സൂചനകൾ:" : "Warning Signs:"}</strong> {savedCard.warningSigns.join(", ")}</p>
                <p><strong>{isML ? "സഹായകരമായ കാര്യങ്ങൾ:" : "What Helps:"}</strong> {savedCard.whatHelps.join(", ")}</p>
                <a
                  href={`tel:${normalizePhoneNumber(savedCard.trustedContactPhone)}`}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold mt-1 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" /> {isML ? `${savedCard.trustedContactName}-നെ വിളിക്കുക` : `Call ${savedCard.trustedContactName}`}
                </a>
              </div>
            )}

            <div className="text-center pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-red-300 hover:text-white underline"
              >
                {isML ? "അടിയന്തര വിൻഡോ അടയ്ക്കുക" : "Close Emergency View"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
