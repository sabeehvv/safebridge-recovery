"use client";

import React, { useState } from "react";
import { SafetyAssessment, Intervention, Language } from "@/lib/schemas";
import { SpokenIntervention } from "./spoken-intervention";
import { CaregiverScript } from "./caregiver-script";
import { TrustedContactAction } from "./trusted-contact-action";
import { VerifiedResourceCard } from "./verified-resource-card";
import { RecoverySafetyCardModal } from "./recovery-safety-card";
import { MapPin, Calendar, Clock, Shield, RotateCcw, Compass } from "lucide-react";

interface RecoveryHandoverProps {
  assessment: SafetyAssessment;
  intervention: Intervention;
  language: Language;
  onReset: () => void;
}

export function RecoveryHandover({
  assessment,
  intervention,
  language,
  onReset
}: RecoveryHandoverProps) {
  const [showCardModal, setShowCardModal] = useState(false);
  const isML = language === "ml";

  const isCaregiver = assessment.mode === "caregiver_concern";

  const openNearestHospitalMaps = () => {
    if (typeof window !== "undefined") {
      window.open("https://www.google.com/maps/search/hospitals+near+me", "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* Screen 3 Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Screen 3 of 3</span>
          <h2 className="text-2xl font-black text-white">
            {isCaregiver
              ? isML ? "പരിപാലക മാർഗ്ഗരേഖ" : "Caregiver Action Plan"
              : isML ? "വീണ്ടെടുക്കൽ & പ്രതിരോധ പ്ലാൻ" : "Recovery & Prevention Plan"}
          </h2>
        </div>
        <button
          onClick={onReset}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isML ? "പുതിയ റിപ്പോർട്ട് തുടങ്ങുക" : "Start New Report"}</span>
        </button>
      </div>

      {/* 1. Spoken Intervention Player */}
      <SpokenIntervention script={intervention.immediateScript} language={language} />

      {/* 2. Immediate Action & Next 30 Minutes */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-sky-400 font-extrabold text-xs uppercase tracking-wider">
          <Clock className="w-5 h-5" />
          <span>{isML ? "ഉടനടിയുള്ള നടപടിയും അടുത്ത 30 മിനിറ്റും" : "Immediate Action & Next 30 Minutes"}</span>
        </div>

        <div className="bg-sky-950/50 border border-sky-800/60 p-4 rounded-2xl">
          <h3 className="font-extrabold text-white text-lg mb-1">{intervention.immediateAction.title}</h3>
          <p className="text-sm text-sky-100 leading-relaxed">{intervention.immediateAction.instruction}</p>
        </div>

        {intervention.nextThirtyMinutes.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {isML ? "അടുത്ത 30 മിനിറ്റ് പ്രോട്ടോക്കോൾ:" : "Next 30 Minutes Protocol:"}
            </h4>
            <ul className="space-y-2 text-xs text-slate-200">
              {intervention.nextThirtyMinutes.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-sky-400 text-sm">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 3. Caregiver View OR Relapse Map View */}
      {isCaregiver && intervention.caregiverScript ? (
        <CaregiverScript
          sayThis={intervention.caregiverScript.sayThis}
          avoidThis={intervention.caregiverScript.avoidThis}
          checkNow={intervention.caregiverScript.checkNow}
          language={language}
        />
      ) : (
        /* Individual Trigger Map */
        intervention.relapseMap && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <Compass className="w-5 h-5" />
              <span>{isML ? "കുറ്റപ്പെടുത്തലില്ലാത്ത ട്രിഗർ മാപ്പും പ്രതിരോധ കുറിപ്പുകളും" : "Non-Judgmental Trigger Map & Prevention Notes"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {intervention.relapseMap.eventBeforeUse && (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-0.5">
                    {isML ? "സാഹചര്യത്തിന് മുമ്പുള്ള സംഭവം:" : "Event Before Situation:"}
                  </span>
                  <span className="text-slate-200">{intervention.relapseMap.eventBeforeUse}</span>
                </div>
              )}
              {intervention.relapseMap.emotionalTrigger && (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-0.5">
                    {isML ? "വൈകാരിക പ്രേരണ:" : "Emotional Trigger:"}
                  </span>
                  <span className="text-slate-200">{intervention.relapseMap.emotionalTrigger}</span>
                </div>
              )}
              {intervention.relapseMap.environmentalTrigger && (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-0.5">
                    {isML ? "ചുറ്റുപാടിലെ പ്രേരണ:" : "Environmental Trigger:"}
                  </span>
                  <span className="text-slate-200">{intervention.relapseMap.environmentalTrigger}</span>
                </div>
              )}
              {intervention.relapseMap.underlyingNeed && (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-0.5">
                    {isML ? "ആന്തരിക ആവശ്യം:" : "Underlying Need:"}
                  </span>
                  <span className="text-slate-200">{intervention.relapseMap.underlyingNeed}</span>
                </div>
              )}
            </div>

            {intervention.relapseMap.preventionUpdate && (
              <div className="bg-amber-950/30 border border-amber-900/60 p-3.5 rounded-xl text-xs text-amber-200">
                <strong>{isML ? "പ്രതിരോധ കുറിപ്പ്:" : "Prevention Note:"}</strong> {intervention.relapseMap.preventionUpdate}
              </div>
            )}
          </div>
        )
      )}

      {/* 4. Trusted Contact Action Message */}
      <TrustedContactAction message={intervention.trustedContactMessage} language={language} />

      {/* 5. Tomorrow Action */}
      {intervention.tomorrowAction && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-extrabold text-xs uppercase tracking-wider">
            <Calendar className="w-5 h-5" />
            <span>{isML ? "നാളത്തെ വീണ്ടെടുക്കൽ കൈമാറ്റ ഘട്ടം" : "Tomorrow's Recovery Handover Step"}</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-medium bg-slate-950 p-4 rounded-2xl border border-slate-800">
            {intervention.tomorrowAction}
          </p>
        </div>
      )}

      {/* 6. Verified Resources */}
      <VerifiedResourceCard resourceIds={intervention.resourceIds} language={language} />

      {/* 7. Action Toolbar (Maps, Local Card, Reset) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
          {isML ? "ഉടനടി ചെയ്യാവുന്ന ഉപകരണങ്ങൾ:" : "Quick Action Tools:"}
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={openNearestHospitalMaps}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white font-bold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all shadow active:scale-95"
          >
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>{isML ? "അടുത്തുള്ള ആശുപത്രി തിരയുക (Maps)" : "Search Nearest Hospital (Maps)"}</span>
          </button>

          <button
            onClick={() => setShowCardModal(true)}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-white font-bold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all shadow active:scale-95"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>{isML ? "സുരക്ഷാ കാർഡ് സൂക്ഷിക്കുക" : "Save Recovery Safety Card"}</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 text-center italic pt-1">
          {intervention.disclaimer || (isML ? "SafeBridge വീണ്ടെടുക്കൽ സഹായ ഉപകരണങ്ങൾ നൽകുന്നു. ഇത് അടിയന്തര വൈദ്യസഹായത്തിന് പകരമല്ല." : "SafeBridge provides recovery support tools. It does not replace emergency or clinical care.")}
        </p>
      </div>

      <RecoverySafetyCardModal isOpen={showCardModal} onClose={() => setShowCardModal(false)} />
    </div>
  );
}
