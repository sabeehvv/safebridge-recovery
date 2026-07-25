import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SafeBridge | GenAI Recovery & Prevention Platform",
  description: "Zero-typing GenAI recovery and prevention platform supporting individuals with substance use disorders and their caregivers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased selection:bg-sky-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
