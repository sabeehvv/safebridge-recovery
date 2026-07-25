"use client";

import React from "react";
import { AlertTriangle, Phone, ShieldCheck, Heart, RefreshCw } from "lucide-react";
import { VERIFIED_RESOURCES, getLocalizedResource } from "@/lib/resources";
import { getSavedSafetyCard } from "@/lib/local-storage";
import { Language } from "@/lib/schemas";

interface SafetyOnlyModeProps {
  reason?: string;
  onRetry?: () => void;
  language?: Language;
}

export function SafetyOnlyMode({ reason, onRetry, language = "en" }: SafetyOnlyModeProps) {
  const [savedCard, setSavedCard] = React.useState<ReturnType<typeof getSavedSafetyCard>>(null);
  const isML = language === "ml";

  React.useEffect(() => {
    setSavedCard(getSavedSafetyCard());
  }, []);

  return (
    <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Transparent Warning Banner */}
      <div className="bg-amber-950/80 border border-amber-800 p-4 rounded-2xl flex items-start gap-3 text-amber-200 text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-extrabold text-amber-300 text-sm uppercase tracking-wide">
            {isML ? "സേഫ്റ്റി-ഓൺലി മോഡ് സജീവം" : "Safety-Only Mode Active"}
          </h3>
          <p className="mt-1 leading-relaxed">
            {reason || (isML
              ? "വ്യക്തിഗത AI വിശകലനം താൽക്കാലികമായി ലഭ്യമല്ല. പ്രധാന അടിയന്തര ഹെൽപ്പ് ലൈനുകളും സേവനങ്ങളും താഴെ ലഭ്യമാണ്."
              : "Personalized AI analysis is temporarily unavailable. All real emergency and verified crisis support services remain fully operational below.")}
          </p>
        </div>
      </div>

      {/* Immediate Emergency Action */}
      <div className="bg-red-950/60 border border-red-800 p-5 rounded-2xl space-y-3">
        <h3 className="text-lg font-black text-red-200 flex items-center gap-2">
          <Phone className="w-5 h-5 text-red-400 animate-bounce" />
          <span>{isML ? "ഉടനടിയുള്ള അടിയന്തര സഹായം (ഇന്ത്യ)" : "Immediate Emergency Help (India)"}</span>
        </h3>
        <p className="text-xs text-red-300">
          {isML
            ? "വ്യക്തിക്ക് പ്രതികരണമില്ലെങ്കിലോ ശ്വാസതടസ്സമുണ്ടെങ്കിലോ ഉടൻ വിളിക്കുക:"
            : "If someone is unresponsive, having breathing difficulty, or in danger:"}
        </p>
        <a
          href="tel:112"
          className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg text-lg transition-all"
        >
          <Phone className="w-6 h-6" />
          {isML ? "112 നമ്പർ വിളിക്കുക (ERSS അടിയന്തരം)" : "CALL 112 NOW (ERSS Emergency)"}
        </a>
      </div>

      {/* Trusted Contact Call */}
      {savedCard && savedCard.trustedContactPhone && (
        <div className="bg-emerald-950/60 border border-emerald-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="text-xs text-emerald-200">
            <p className="font-bold">{isML ? "സേവ് ചെയ്ത വിശ്വസ്ത വ്യക്തിയെ വിളിക്കുക:" : "Call Your Saved Trusted Contact:"}</p>
            <p className="text-emerald-400 font-extrabold text-sm">{savedCard.trustedContactName}</p>
          </div>
          <a
            href={`tel:${savedCard.trustedContactPhone}`}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>{isML ? "ബന്ധപ്പെടുക" : "Call Contact"}</span>
          </a>
        </div>
      )}

      {/* Grounding Exercise */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
        <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
          <Heart className="w-5 h-5 text-sky-400" />
          <span>{isML ? "ലളിതമായ 5-4-3-2-1 ഇന്ദ്രിയ ഗ്രൗണ്ടിംഗ് രീതി" : "Simple 5-4-3-2-1 Sensory Grounding Action"}</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <strong className="text-sky-400">{isML ? "5 കാര്യങ്ങൾ:" : "5 Things:"}</strong> {isML ? "ചുറ്റും നോക്കി 5 വസ്തുക്കളുടെ പേര് മനസ്സിൽ പറയുക." : "Look around and name 5 things you see."}
          </div>
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <strong className="text-sky-400">{isML ? "4 കാര്യങ്ങൾ:" : "4 Things:"}</strong> {isML ? "ചുറ്റുമുള്ള 4 വസ്തുക്കളിൽ സ്പർശിക്കുക." : "Touch 4 physical objects around you."}
          </div>
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <strong className="text-sky-400">{isML ? "3 കാര്യങ്ങൾ:" : "3 Things:"}</strong> {isML ? "കേൾക്കുന്ന 3 ശബ്ദങ്ങൾ ശ്രദ്ധിക്കുക." : "Listen for 3 distinct background sounds."}
          </div>
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <strong className="text-sky-400">{isML ? "2 കാര്യങ്ങൾ:" : "2 Things:"}</strong> {isML ? "2 സുഗന്ധം / ശ്വാസം നന്നായി എടുക്കുക." : "Smell 2 things or take deep breaths."}
          </div>
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 sm:col-span-2">
            <strong className="text-sky-400">{isML ? "1 കാര്യം:" : "1 Thing:"}</strong> {isML ? "1 രുചി / ദീർഘ ശ്വാസം / നല്ല ചിന്ത." : "1 thing you can taste / 1 deep breath / positive thought."}
          </div>
        </div>
      </div>

      {/* Verified Helplines List */}
      <div className="space-y-3">
        <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>{isML ? "സ്ഥിരീകരിച്ച ഹെൽപ്പ് ലൈനുകൾ & സഹായ കേന്ദ്രങ്ങൾ:" : "Verified Government Crisis Support Lines:"}</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {VERIFIED_RESOURCES.map((res) => {
            const loc = getLocalizedResource(res, language);
            return (
              <div key={res.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="font-bold text-white">{loc.name}</div>
                <p className="text-slate-400 text-[11px]">{loc.purpose}</p>
                <a
                  href={`tel:${res.phone}`}
                  className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold px-3 py-1.5 rounded-lg text-xs"
                >
                  <Phone className="w-3.5 h-3.5" /> {isML ? `വിളിക്കുക ${res.phone}` : `Call ${res.phone}`}
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {onRetry && (
        <div className="text-center pt-2">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-5 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isML ? "AI വിശകലനം വീണ്ടും ശ്രമിക്കുക" : "Try AI Analysis Again"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
