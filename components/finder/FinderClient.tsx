"use client";

import { useEffect, useState } from "react";
import InstrumentSelector from "./InstrumentSelector";
import ModeTabs from "./ModeTabs";
import RootSelector from "./RootSelector";
import ChordResult from "./ChordResult";
import ScaleResult from "./ScaleResult";
import type { ChordType, FinderMode, Instrument, NoteName, ScaleType } from "./types";

const DEFAULT_INSTRUMENT: Instrument = "Guitar";
const DEFAULT_MODE: FinderMode = "Chords";
const DEFAULT_ROOT: NoteName = "C";
const DEFAULT_CHORD: ChordType = "Major";
const DEFAULT_SCALE: ScaleType = "Major (Ionian)";

const STORAGE_KEYS = {
  instrument: "tonehouse_finder_instrument",
  mode: "tonehouse_finder_mode",
  root: "tonehouse_finder_root",
} as const;

function readStorage<T>(key: string, fallback: T) {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(key);
  return stored ? (stored as T) : fallback;
}

function normalizeInstrument(value: string): Instrument {
  if (value === "Keyboards") return "Piano / Keys";
  if (value === "Piano / Keys") return "Piano / Keys";
  if (value === "Bass") return "Bass";
  return "Guitar";
}

export default function FinderClient() {
  const [instrument, setInstrument] = useState<Instrument>(DEFAULT_INSTRUMENT);
  const [mode, setMode] = useState<FinderMode>(DEFAULT_MODE);
  const [root, setRoot] = useState<NoteName>(DEFAULT_ROOT);
  const [chordType, setChordType] = useState<ChordType>(DEFAULT_CHORD);
  const [scaleType, setScaleType] = useState<ScaleType>(DEFAULT_SCALE);

  useEffect(() => {
    const storedInstrument = readStorage(STORAGE_KEYS.instrument, DEFAULT_INSTRUMENT) as string;
    setInstrument(normalizeInstrument(storedInstrument));
    setMode(readStorage(STORAGE_KEYS.mode, DEFAULT_MODE));
    setRoot(readStorage(STORAGE_KEYS.root, DEFAULT_ROOT));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.instrument, instrument);
  }, [instrument]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.mode, mode);
  }, [mode]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.root, root);
  }, [root]);

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
        <InstrumentSelector value={instrument} onChange={setInstrument} />
        <ModeTabs value={mode} onChange={setMode} />
        <RootSelector value={root} onChange={setRoot} />
      </div>

      <div>
        {mode === "Chords" ? (
          <ChordResult
            root={root}
            type={chordType}
            instrument={instrument}
            onTypeChange={setChordType}
          />
        ) : (
          <ScaleResult
            root={root}
            type={scaleType}
            instrument={instrument}
            onTypeChange={setScaleType}
          />
        )}
      </div>
    </div>
  );
}
