"use client";

import { useState } from "react";
import CoachForm from "../components/CoachForm";

export default function CoachPage() {
  const [instrument, setInstrument] = useState("Drums");

  return (
    <main className="relative min-h-screen bg-black text-zinc-100 overflow-hidden">

      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-zinc-800/20 blur-3xl" />
        <div className="absolute bottom-[-200px] left-20 h-96 w-96 rounded-full bg-zinc-900/40 blur-3xl" />
      </div>

      {/* LOGO — BIGGER */}
      <img
        src="/tonehouse-logo.png"
        alt="Tonehouse Studios"
        className="absolute left-2 top-8 h-22 w-auto opacity-95"
      />

      {/* Centered content */}
      <div className="relative mx-auto max-w-4xl px-6 py-24">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight text-white">
              Tonehouse AI Coach
            </h1>

            <p className="mt-4 text-lg text-zinc-400">
              {instrument} practice guidance crafted with precision.
            </p>
          </div>

          <span className="rounded-full border border-white/15 bg-zinc-950/70 px-4 py-1.5 text-sm tracking-wide text-zinc-300 backdrop-blur">
            Studio Edition
          </span>
        </div>

        {/* App card */}
        <div className="mt-14 rounded-[2rem] border border-white/15 ring-1 ring-white/10 bg-zinc-950/60 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <CoachForm
            instrument={instrument}
            onInstrumentChange={setInstrument}
          />
        </div>

        {/* Footer */}
        <p className="mt-12 text-center text-sm text-zinc-500">
          Tonehouse Studios · Precision · Discipline · Expression
        </p>
      </div>
    </main>
  );
}
