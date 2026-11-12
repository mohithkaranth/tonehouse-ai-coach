"use client";

import { playChord } from "@/lib/audio/chordPlayer";
import { buildChord, buildSpelledChord, CHROMATIC_NOTES } from "@/lib/music";
import { getGuitarShape } from "@/lib/guitar-shapes";
import type { ChordType, Instrument, NoteName } from "./types";

const chordTypes: ChordType[] = [
  "Major",
  "Minor",
  "Dominant 7",
  "Major 7",
  "Minor 7",
  "Sus2",
  "Sus4",
  "Diminished",
  "Augmented",
];

function buildOctaveNotes(tones: NoteName[], baseOctave: number) {
  let octave = baseOctave;
  let last = CHROMATIC_NOTES.indexOf(tones[0]);

  return tones.map((note, i) => {
    const idx = CHROMATIC_NOTES.indexOf(note);
    if (i > 0 && idx <= last) octave++;
    last = idx;
    return `${note}${octave}`;
  });
}

interface Props {
  root: NoteName;
  type: ChordType;
  instrument: Instrument;
  onTypeChange: (type: ChordType) => void;
}

export default function ChordResult({
  root,
  type,
  instrument,
  onTypeChange,
}: Props) {
  const tones = buildChord(root, type);
  const chordName = `${root} ${type}`;
  const tonesDisplay = buildSpelledChord(root, type).join("–");

  const shape = getGuitarShape(root, type);

  const handlePlayChord = async () => {
    // 🎸 BASS — NO CHORDS
    if (instrument === "Bass") {
      await playChord([`${root}2`], {
        durationSec: 1.8,
        type: "sawtooth",
        gain: 0.35,
      });
      return;
    }

    // 🎸 GUITAR — FULL CHORD
    await playChord(buildOctaveNotes(tones, 3), {
      arpeggiateMs: 40,
      durationSec: 1.6,
      type: "triangle",
      gain: 0.16,
    });
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="text-2xl font-semibold text-zinc-50">
        {chordName}
      </h2>

      <p className="mt-2 text-sm text-zinc-400">
        Chord tones: {tonesDisplay}
      </p>

      <div className="mt-4 flex gap-2">
        <select
          value={type}
          onChange={(e) =>
            onTypeChange(e.target.value as ChordType)
          }
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
        >
          {chordTypes.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={handlePlayChord}
          className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
        >
          ▶ Play
        </button>
      </div>

      {instrument === "Guitar" && (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
          <p className="text-sm font-medium text-zinc-200">
            Guitar shapes
          </p>

          <p className="mt-2 text-sm text-zinc-400">
            <span className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-2 py-1 font-mono text-xs">
              {shape}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
