"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Send, ShieldCheck, AlertCircle, FileText } from "lucide-react";
import { Language } from "@/lib/schemas";
import { PRIVACY_DISCLOSURE } from "@/lib/privacy";

interface VoiceRecorderProps {
  language: Language;
  onAudioSubmit: (audioBlob: Blob | null, textFallback?: string) => void;
  isAnalyzing: boolean;
}

export function VoiceRecorder({
  language,
  onAudioSubmit,
  isAnalyzing
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [fallbackText, setFallbackText] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isML = language === "ml";

  const getSupportedMimeType = (): string => {
    if (typeof window === "undefined" || !window.MediaRecorder) return "";
    const candidateTypes = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/wav"
    ];
    for (const type of candidateTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "";
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setMicPermissionError(null);
    audioChunksRef.current = [];
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error("Audio recording is not supported by this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const supportedType = getSupportedMimeType();
      const options = supportedType ? { mimeType: supportedType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || supportedType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error: unknown) {
      console.error("Microphone access error:", error);
      setMicPermissionError(
        isML
          ? "മൈക്രോഫോൺ അനുമതി ലഭിച്ചില്ല. ദയവായി ക്രമീകരണങ്ങൾ പരിശോധിക്കുക അല്ലെങ്കിൽ താഴെ ടൈപ്പ് ചെയ്യുക."
          : "Microphone access was denied. Please allow microphone permissions or use the text fallback below."
      );
      setShowTextFallback(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleDeleteRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSubmit = () => {
    if (audioBlob) {
      onAudioSubmit(audioBlob, fallbackText.trim() || undefined);
    } else if (fallbackText.trim()) {
      onAudioSubmit(null, fallbackText.trim());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-white">
          {isML ? "നിങ്ങളുടെ ശബ്ദത്തിൽ സംസാരിക്കുക" : "Speak What Is Happening"}
        </h2>
        <p className="text-xs text-slate-400">
          {isML
            ? "ടൈപ്പ് ചെയ്യേണ്ടതില്ല. നിങ്ങളുടെ ആശങ്കയോ സാഹചര്യമോ പകർത്തി പറയുക."
            : "No typing required. Tap the microphone and describe the current situation."}
        </p>
      </div>

      {micPermissionError && (
        <div className="bg-amber-950/80 border border-amber-800 text-amber-300 p-4 rounded-2xl text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <div>
            <p className="font-bold mb-1">{micPermissionError}</p>
            <p>
              {isML
                ? "നിങ്ങൾക്ക് താഴെയുള്ള ടെക്സ്റ്റ് ഇൻപുട്ട് ഓപ്ഷൻ ഉപയോഗിക്കാം."
                : "You can use the accessibility text input below."}
            </p>
          </div>
        </div>
      )}

      {/* Main Microphone Action Area */}
      {!audioBlob ? (
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isAnalyzing}
            aria-pressed={isRecording}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-2xl ${
              isRecording
                ? "bg-red-600 ring-8 ring-red-950 animate-pulse"
                : "bg-sky-500 hover:bg-sky-400 ring-8 ring-sky-950/60"
            }`}
            aria-label={isRecording ? (isML ? "റെക്കോർഡിംഗ് നിർത്തുക" : "Stop Recording") : (isML ? "റെക്കോർഡിംഗ് ആരംഭിക്കുക" : "Start Recording")}
          >
            {isRecording ? (
              <Square className="w-10 h-10 text-white fill-current" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </button>

          <div className="text-center">
            {isRecording ? (
              <div className="space-y-1">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-950 text-red-400 border border-red-800 rounded-full text-xs font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  {isML ? `റെക്കോർഡിംഗ് നടക്കുന്നു (${formatTime(recordingTime)})` : `Recording (${formatTime(recordingTime)})`}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  {isML ? "അവസാനിപ്പിക്കാൻ ടാപ്പ് ചെയ്യുക" : "Tap to stop when finished"}
                </p>
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-300">
                {isML ? "ശബ്ദം റെക്കോർഡ് ചെയ്യാൻ ടാപ്പ് ചെയ്യുക" : "Tap to record your voice"}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Recording Playback & Review Area */
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <Mic className="w-4 h-4" />
              {isML ? `റെക്കോർഡിംഗ് തയ്യാറാണ് (${formatTime(recordingTime)})` : `Recording Ready (${formatTime(recordingTime)})`}
            </span>
            <button
              onClick={handleDeleteRecording}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {isML ? "ഡിലീറ്റ് ചെയ്തു വീണ്ടും റെക്കോർഡ് ചെയ്യുക" : "Delete & Re-record"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayback}
              className="p-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl transition-all"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <audio
              ref={audioRef}
              src={audioUrl || ""}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              className="hidden"
            />
            <div className="flex-1 bg-slate-900 h-3 rounded-full overflow-hidden relative">
              <div className={`bg-sky-400 h-full transition-all ${isPlaying ? "w-full duration-1000" : "w-1/2"}`} />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isAnalyzing}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isML ? "ജെമിനി ഉപയോഗിച്ച് സാഹചര്യം വിശകലനം ചെയ്യുന്നു..." : "Analyzing Situation with Gemini..."}
              </span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>{isML ? "വിശകലനത്തിനായി അയക്കുക" : "Analyze Situation Securely"}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Accessibility Text Fallback */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowTextFallback(!showTextFallback)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 mx-auto"
        >
          <FileText className="w-4 h-4" />
          <span>
            {showTextFallback
              ? (isML ? "ടെക്സ്റ്റ് ഇൻപുട്ട് മറയ്ക്കുക" : "Hide text input")
              : (isML ? "ടെക്സ്റ്റ് റിപ്പോർട്ട് ഉപയോഗിക്കുക (ലഭ്യതാ ഓപ്ഷൻ)" : "Text fallback (Accessibility option)")}
          </span>
        </button>

        {showTextFallback && (
          <div className="mt-3 space-y-3">
            <textarea
              value={fallbackText}
              onChange={(e) => setFallbackText(e.target.value)}
              placeholder={
                isML
                  ? "മൈക്രോഫോൺ ലഭ്യമല്ലെങ്കിൽ സാഹചര്യം ഇവിടെ വിവരിക്കുക..."
                  : "Describe the situation here if microphone is unavailable..."
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-sky-500 h-24"
              maxLength={10_000}
              aria-label={isML ? "സാഹചര്യത്തിന്റെ എഴുത്ത് വിവരണം" : "Written description of the situation"}
            />
            {!audioBlob && fallbackText.trim() && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl text-sm"
              >
                {isML ? "ടെക്സ്റ്റ് റിപ്പോർട്ട് സമർപ്പിക്കുക" : "Submit Text Report"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Privacy Disclosure Footer */}
      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>{PRIVACY_DISCLOSURE.title}</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Audio is sent to the SafeBridge server and Google Gemini for this analysis. SafeBridge does not
          intentionally store the recording in an application database.
        </p>
      </div>
    </div>
  );
}
