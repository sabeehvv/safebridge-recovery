"use client";

import React from "react";
import { getResourceById, VERIFIED_RESOURCES, VerifiedResource, getLocalizedResource } from "@/lib/resources";
import { PhoneCall, ShieldCheck, ExternalLink } from "lucide-react";
import { Language } from "@/lib/schemas";

interface VerifiedResourceCardProps {
  resourceIds?: string[];
  language?: Language;
}

export function VerifiedResourceCard({ resourceIds, language = "en" }: VerifiedResourceCardProps) {
  const isML = language === "ml";

  const resources: VerifiedResource[] = resourceIds && resourceIds.length > 0
    ? resourceIds.map(id => getResourceById(id)).filter((r): r is VerifiedResource => r !== undefined)
    : VERIFIED_RESOURCES;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-2 text-sky-400 font-extrabold text-xs uppercase tracking-wider">
        <ShieldCheck className="w-5 h-5" />
        <span>{isML ? "സ്ഥിരീകരിച്ച ഹെൽപ്പ് ലൈനുകൾ & സഹായ കേന്ദ്രങ്ങൾ" : "Verified Human Support & Crisis Helplines"}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((res) => {
          const loc = getLocalizedResource(res, language);
          return (
            <div
              key={res.id}
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] bg-sky-950 text-sky-300 font-bold px-2 py-0.5 rounded border border-sky-800">
                    {loc.provider}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isML ? `സ്ഥിരീകരിച്ചത്: ${res.lastVerified}` : `Verified: ${res.lastVerified}`}
                  </span>
                </div>
                <h4 className="font-extrabold text-white text-base leading-snug">{loc.name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{loc.purpose}</p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <a
                  href={`tel:${res.phone}`}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isML ? `വിളിക്കുക (${res.phone})` : `Call ${res.phone}`}</span>
                </a>
                <a
                  href={res.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800"
                  title={isML ? "ഔദ്യോഗിക ഉറവിടം കാണുക" : "View Official Source"}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
