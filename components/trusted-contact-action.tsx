"use client";

import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Copy, Share2, Phone, Check } from "lucide-react";
import { Language } from "@/lib/schemas";
import { normalizePhoneNumber } from "@/lib/local-storage";

interface TrustedContactActionProps {
  message: string | null;
  contactPhone?: string | null;
  language?: Language;
}

export function TrustedContactAction({ message, contactPhone, language = "en" }: TrustedContactActionProps) {
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isML = language === "ml";

  if (!message) return null;

  // Extract phone number from message if not explicitly provided in prop
  const extractedPhone = message.match(/(\+?\d[\d\s-]{7,}\d)/)?.[0]?.trim();
  const phoneToCall = contactPhone || extractedPhone;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Copy error:", err);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: isML ? "SafeBridge സഹായ അഭ്യർത്ഥന" : "SafeBridge Support Request",
          text: message
        });
      } catch (error: unknown) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Share failed:", error);
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
        <MessageCircle className="w-5 h-5" />
        <span>{isML ? "വിശ്വസ്ത വ്യക്തിക്കുള്ള സഹായ സന്ദേശം" : "Exact Trusted-Person Support Request Message"}</span>
      </div>

      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 relative">
        <p className="text-sm text-slate-200 leading-relaxed font-mono">
          "{message}"
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Direct tel: Call Contact button when trusted contact phone number is present */}
        {phoneToCall && (
          <a
            href={`tel:${normalizePhoneNumber(phoneToCall)}`}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 min-w-[140px]"
          >
            <Phone className="w-4 h-4" />
            <span>{isML ? `ബന്ധപ്പെടുക (${phoneToCall})` : `Call Contact (${phoneToCall})`}</span>
          </a>
        )}

        <button
          onClick={handleCopy}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 min-w-[140px]"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>
            {copied
              ? (isML ? "കോപ്പി ചെയ്തു!" : "Copied to Clipboard!")
              : (isML ? "സന്ദേശം കോപ്പി ചെയ്യുക" : "Copy Message")}
          </span>
        </button>

        <button
          onClick={handleShare}
          className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 min-w-[140px]"
        >
          <Share2 className="w-4 h-4" />
          <span>{isML ? "സന്ദേശം പങ്കുവെക്കുക" : "Share Message"}</span>
        </button>
      </div>
    </div>
  );
}
  useEffect(
    () => () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    },
    []
  );
