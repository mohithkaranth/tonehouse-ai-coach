"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function MetronomePage() {
  const [bpm, setBpm] = useState(80);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const currentBeatRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const lookaheadMs = 25;
  const scheduleAheadTime = 0.1;

  const secondsPerBeat = useMemo(() => 60 / bpm, [bpm]);

  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }

  function scheduleClick(time: number, accent: boolean) {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = accent ? 1200 : 800;

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(accent ? 0.6 : 0.4, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.04);
  }

  function scheduler() {
    const ctx = getAudioCtx();

    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      const beat = currentBeatRef.current % beatsPerBar;
      scheduleClick(nextNoteTimeRef.current, beat === 0);

      nextNoteTimeRef.current += secondsPerBeat;
      currentBeatRef.current++;
    }
  }

  async function start() {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") await ctx.resume();

    currentBeatRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.05;

    timerRef.current = window.setInterval(scheduler, lookaheadMs);
    setIsPlaying(true);
  }

  function stop() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setIsPlaying(false);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm hover:bg-zinc-900 transition"
          >
            ← Back
          </Link>

          <div className="text-sm text-zinc-400">Tonehouse Tools</div>
        </div>

        <h1 className="mt-10 text-3xl font-semibold tracking-tight">🎛 Metronome</h1>
        <p className="mt-2 text-zinc-400">
          Keep perfect time during practice sessions.
        </p>

        {/* Centered card */}
        <div className="mt-10 mx-auto w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8">
          <label className="text-sm font-medium text-zinc-200">BPM</label>

          <input
            type="range"
            min={40}
            max={220}
            value={bpm}
            onChange={(e) => setBpm(clamp(+e.target.value, 40, 220))}
            disabled={isPlaying}
            className="mt-3 w-full accent-white"
          />

          <div className="mt-3 text-3xl font-semibold tabular-nums">
            {bpm} <span className="text-zinc-400 text-lg font-normal">BPM</span>
          </div>

          <label className="mt-6 block text-sm font-medium text-zinc-200">
            Beats per bar
          </label>

          <select
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100"
            value={beatsPerBar}
            onChange={(e) => setBeatsPerBar(+e.target.value)}
            disabled={isPlaying}
          >
            {[2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <div className="mt-8 flex items-center gap-3">
            {!isPlaying ? (
              <button
                onClick={start}
                className="rounded-2xl bg-white px-8 py-3 text-black font-medium hover:bg-zinc-200 transition"
              >
                Start
              </button>
            ) : (
              <button
                onClick={stop}
                className="rounded-2xl border border-zinc-700 px-8 py-3 hover:bg-zinc-800 transition"
              >
                Stop
              </button>
            )}

            <div className="text-sm text-zinc-400">
              Accent on beat 1
            </div>
          </div>

          <p className="mt-6 text-xs text-zinc-500">
            Tip: On mobile Safari, audio starts only after a user tap (browser autoplay rules).
          </p>
        </div>
      </div>
    </main>
  );
}
