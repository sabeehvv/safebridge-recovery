"use client";

import React, { useEffect, useRef, useState } from "react";
import { getSavedSafetyCard, saveSafetyCard, deleteSafetyCard, RecoverySafetyCard } from "@/lib/local-storage";
import { Shield, Save, Trash2, Check, X } from "lucide-react";
import { Language } from "@/lib/schemas";

export function RecoverySafetyCardModal({
  isOpen,
  onClose,
  language = "en"
}: {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
}) {
  const createEmptyCard = (): RecoverySafetyCard => ({
    preferredName: "",
    trustedContactName: "",
    trustedContactPhone: "",
    warningSigns: [""],
    whatHelps: [""],
    caregiverShouldSay: [""],
    caregiverShouldAvoid: [""],
    professionalSupportPhone: "14446",
    emergencyPhone: "112",
    preferredLanguage: language,
    updatedAt: new Date().toISOString()
  });
  const [card, setCard] = useState<RecoverySafetyCard>(
    () => getSavedSafetyCard() || createEmptyCard()
  );

  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isML = language === "ml";

  useEffect(
    () => () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    },
    []
  );

  if (!isOpen) return null;

  const handleSave = () => {
    const updated = { ...card, preferredLanguage: language, updatedAt: new Date().toISOString() };
    saveSafetyCard(updated);
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = () => {
    deleteSafetyCard();
    setCard(createEmptyCard());
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="safety-card-title"
        className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sky-400 font-extrabold text-lg">
            <Shield className="w-6 h-6" />
            <span id="safety-card-title">{isML ? "വ്യക്തിഗത സുരക്ഷാ കാർഡ്" : "Personal Recovery Safety Card"}</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white" aria-label="Close">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {isML
            ? "നിങ്ങളുടെ ഉപകരണത്തിൽ പ്രാദേശികമായി മാത്രം സൂക്ഷിക്കുന്നു. പുറത്തുള്ള സെർവറുകളിലേക്ക് അപ്‌ലോഡ് ചെയ്യുന്നില്ല."
            : "Stored locally on your device. Never uploaded to external servers. Use this card during cravings or emergencies."}
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <label htmlFor="preferred-name" className="block text-slate-300 font-bold mb-1">
              {isML ? "ഇഷ്ടമുള്ള പേര്" : "Preferred Name"}
            </label>
            <input
              type="text"
              id="preferred-name"
              autoComplete="name"
              value={card.preferredName}
              onChange={(e) => setCard({ ...card, preferredName: e.target.value })}
              placeholder={isML ? "ഉദാ: അലക്സ്" : "e.g. Alex"}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="trusted-contact-name" className="block text-slate-300 font-bold mb-1">
                {isML ? "വിശ്വസ്ത വ്യക്തിയുടെ പേര്" : "Trusted Contact Name"}
              </label>
              <input
                type="text"
                id="trusted-contact-name"
                autoComplete="name"
                value={card.trustedContactName}
                onChange={(e) => setCard({ ...card, trustedContactName: e.target.value })}
                placeholder={isML ? "ഉദാ: സാറ (സഹോദരി)" : "e.g. Sarah (Sister)"}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label htmlFor="trusted-contact-phone" className="block text-slate-300 font-bold mb-1">
                {isML ? "വിശ്വസ്ത വ്യക്തിയുടെ ഫോൺ നമ്പർ" : "Trusted Contact Phone"}
              </label>
              <input
                type="tel"
                id="trusted-contact-phone"
                autoComplete="tel"
                value={card.trustedContactPhone}
                onChange={(e) => setCard({ ...card, trustedContactPhone: e.target.value })}
                placeholder={isML ? "ഉദാ: +91 98765 43210" : "e.g. +91 98765 43210"}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="warning-signs" className="block text-slate-300 font-bold mb-1">
              {isML ? "വ്യക്തിഗത മുന്നറിയിപ്പ് സൂചനകൾ" : "Personal Warning Signs"}
            </label>
            <input
              type="text"
              id="warning-signs"
              value={card.warningSigns.join(", ")}
              onChange={(e) => setCard({ ...card, warningSigns: e.target.value.split(", ") })}
              placeholder={isML ? "ഉദാ: ഒറ്റപ്പെടൽ, മാനസിക സംഘർഷം" : "e.g. Isolation, stress, late night arguments"}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label htmlFor="grounding-actions" className="block text-slate-300 font-bold mb-1">
              {isML ? "ശാന്തനാകാൻ സഹായിക്കുന്നവ" : "What Helps Me Ground"}
            </label>
            <input
              type="text"
              id="grounding-actions"
              value={card.whatHelps.join(", ")}
              onChange={(e) => setCard({ ...card, whatHelps: e.target.value.split(", ") })}
              placeholder={isML ? "ഉദാ: തണുത്ത വെള്ളം, 5 മിനിറ്റ് നടക്കുക" : "e.g. Cold water on face, calling Sarah, 5-minute walk"}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>
              {saved
                ? (isML ? "പ്രാദേശികമായി സൂക്ഷിച്ചു!" : "Saved Locally!")
                : (isML ? "സുരക്ഷാ കാർഡ് സൂക്ഷിക്കുക" : "Save Safety Card")}
            </span>
          </button>
          <button
            onClick={handleDelete}
            className="p-3 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-800 rounded-xl text-xs flex items-center gap-1 transition-all"
            title={isML ? "ഡിലീറ്റ് ചെയ്യുക" : "Delete Card"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
