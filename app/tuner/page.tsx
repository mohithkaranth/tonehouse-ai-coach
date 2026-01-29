"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const A4 = 440;
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function noteFromFrequency(freq: number) {
  return Math.round(12 * Math.log2(freq / A4) + 69);
}

function frequencyFromNoteNumber(note: number) {
  return A4 * Math.pow(2, (note - 69) / 12);
}

function centsOffFromPitch(freq: number, note: number) {
  return Math.floor(1200 * Math.log2(freq / frequencyFromNoteNumber(note)));
}

// Basic autocorrelation pitch detection
function autoCorrelate(buffer: Float32Array, sampleRate: number) {
  let rms = 0;
  for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.01) return -1;

  // Trim
  let r1 = 0;
  let r2 = buffer.length - 1;
  const threshold = 0.2;

  for (let i = 0; i < buffer.length / 2; i++) {
    if (Math.abs(buffer[i]) < threshold) r1 = i;
    else break;
  }
  for (let i = 1; i < buffer.length / 2; i++) {
    if (Math.abs(buffer[buffer.length - i]) < threshold) r2 = buffer.length - i;
    else break;
  }

  const buf = buffer.slice(r1, r2);
  const size = buf.length;
  const c = new Array<number>(size).fill(0);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size - i; j++) {
      c[i] = c[i] + buf[j] * buf[j + i];
    }
  }

  let d = 0;
  while (d + 1 < size && c[d] > c[d + 1]) d++;

  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < size; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  if (maxpos <= 0) return -1;

  // Simple result (good enough); can refine later with interpolation
  return sampleRate / maxpos;
}

export default function TunerPage() {
  const [freq, setFreq] = useState<number | null>(null);
  const [note, setNote] = useState<number | null>(null);
  const [cents, setCents] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const displayNote = useMemo(() => {
    if (note == null) return "—";
    return `${NOTE_NAMES[note % 12]}${Math.floor(note / 12) - 1}`;
  }, [note]);

  async function start() {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;

      analyserRef.current = analyser;
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      setListening(true);

      const tick = () => {
        const a = analyserRef.current;
        const c = audioCtxRef.current;
        if (!a || !c) return;

        a.getFloatTimeDomainData(buffer);
        const f = autoCorrelate(buffer, c.sampleRate);

        if (f !== -1) {
          const n = noteFromFrequency(f);
          setFreq(f);
          setNote(n);
          setCents(centsOffFromPitch(f, n));
        } else {
          setFreq(null);
          setNote(null);
          setCents(null);
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } catch (e: any) {
      const name = e?.name || "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setError("Microphone permission denied. Please allow mic access in your browser settings.");
      } else {
        setError("Could not start the tuner. Please try again.");
      }
      setListening(false);
    }
  }

  function stop() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    analyserRef.current = null;

    setListening(false);
    setFreq(null);
    setNote(null);
    setCents(null);
  }

  useEffect(() => {
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        <h1 className="mt-10 text-3xl font-semibold tracking-tight">🎸 Tuner</h1>
        <p className="mt-2 text-zinc-400">
          Tune your instrument using your microphone.
        </p>

        {/* Centered card */}
        <div className="mt-10 mx-auto w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8">
          <div className="text-center">
            <div className="text-sm text-zinc-400">Detected Note</div>
            <div className="mt-2 text-6xl font-semibold tabular-nums">{displayNote}</div>

            <div className="mt-3 text-zinc-400 tabular-nums">
              {freq ? `${freq.toFixed(1)} Hz` : "—"}
            </div>

            <div className="mt-5 text-lg tabular-nums">
              {cents == null ? (
                <span className="text-zinc-500">—</span>
              ) : (
                <span>
                  {cents > 0 ? "+" : ""}
                  {cents} <span className="text-zinc-400">cents</span>
                </span>
              )}
            </div>

            <div className="mt-3 text-xs text-zinc-500">
              Aim for 0 cents (center). Negative = flat, positive = sharp.
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            {!listening ? (
              <button
                onClick={start}
                className="rounded-2xl bg-white px-8 py-3 text-black font-medium hover:bg-zinc-200 transition"
              >
                Start Listening
              </button>
            ) : (
              <button
                onClick={stop}
                className="rounded-2xl border border-zinc-700 px-8 py-3 hover:bg-zinc-800 transition"
              >
                Stop
              </button>
            )}
          </div>

          {error && (
            <p className="mt-6 text-sm text-red-400 text-center">{error}</p>
          )}

          <p className="mt-6 text-xs text-zinc-500 text-center">
            Best results: quiet room, hold the instrument close to the mic.
          </p>
        </div>
      </div>
    </main>
  );
}
