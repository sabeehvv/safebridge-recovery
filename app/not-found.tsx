import Link from "next/link";
import { Shield } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-500/30">
        <Shield className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black">404 - Page Not Found</h1>
      <p className="text-slate-400 text-sm max-w-md">
        The requested page does not exist. Please return to the SafeBridge crisis recovery homepage.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition-all shadow-md"
      >
        Return to SafeBridge Home
      </Link>
    </div>
  );
}
