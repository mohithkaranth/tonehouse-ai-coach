"use client";

import { useState } from "react";
import { playChord } from "@/lib/audio/chordPlayer";
import { buildChord } from "@/lib/music";
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

const OPEN_CHORD_ROOTS = ["C", "D", "E", "G", "A"];

const NEEDS_BARRE = ["F", "B", "C#", "D#", "F#", "G#", "A#"];

const GUITAR_SHAPES: Record<string, string[]> = {
  "C|Major": ["x32010"],
  "G|Major": ["320003"],
  "D|Major": ["xx0232"],
  "A|Major": ["x02220"],
  "E|Major": ["022100"],

  "C|Minor": ["x35543"],
  "D|Minor": ["xx0231"],
  "E|Minor": ["022000"],
  "A|Minor": ["x02210"],
  "G|Minor": ["355333"],

  "C|Dominant 7": ["x32310"],
  "G|Dominant 7": ["320001"],
  "D|Dominant 7": ["xx0212"],
  "A|Dominant 7": ["x02020"],
  "E|Dominant 7": ["020100"],

  "C|Major 7": ["x32000"],
  "G|Major 7": ["320002"],
  "D|Major 7": ["xx0222"],
  "A|Major 7": ["x02120"],
  "E|Major 7": ["021100"],

  "D|Minor 7": ["xx0211"],
  "A|Minor 7": ["x02010"],
  "E|Minor 7": ["022030"],
  "G|Minor 7": ["353333"],

  "C|Sus2": ["x30010"],
  "D|Sus2": ["xx0230"],
  "G|Sus2": ["320033"],
  "A|Sus2": ["x02200"],

  "C|Sus4": ["x33011"],
  "D|Sus4": ["xx0233"],
  "G|Sus4": ["330013"],
  "A|Sus4": ["x02230"],
};

const BARRE_SHAPES: Record<ChordType, string> = {
  Major: "E-shape barre",
  Minor: "Em-shape barre",
  "Dominant 7": "E7-shape barre",
  "Major 7": "Emaj7-shape barre",
  "Minor 7": "Em7-shape barre",
  Sus2: "Esus2-shape barre",
  Sus4: "Esus4-shape barre",
  Diminished: "Diminished barre",
  Augmented: "Augmented barre",
};

const noteOrder = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

function getBarreFret(root: NoteName) {
  const rootIndex = noteOrder.indexOf(root);
  const eIndex = noteOrder.indexOf("E");
  return rootIndex >= eIndex
    ? rootIndex - eIndex
    : rootIndex + 12 - eIndex;
}

function buildOctaveNotes(tones: NoteName[], baseOctave: number) {
  let octave = baseOctave;
  let last = noteOrder.indexOf(tones[0]);

  return tones.map((note, i) => {
    const idx = noteOrder.indexOf(note);
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
  const tonesDisplay = tones.join("–");

  const needsBarre = NEEDS_BARRE.includes(root);

  const shapes =
    GUITAR_SHAPES[`${root}|${type}`] ??
    (needsBarre
      ? [`${BARRE_SHAPES[type]} @ fret ${getBarreFret(root)}`]
      : []);

  const handlePlayChord = async () => {
    if (instrument !== "Guitar") return;

    await playChord(buildOctaveNotes(tones, 3), {
      arpeggiateMs: 40,
      durationSec: 1.6,
      type: "triangle",
      gain: 0.16,
    });
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="text-2xl font-semibold text-zinc-50">{chordName}</h2>

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

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
        <p className="text-sm font-medium text-zinc-200">
          Guitar shapes
        </p>

        {shapes.length > 0 ? (
          <ul className="mt-2 space-y-2 text-sm text-zinc-400">
            {shapes.map((shape) => (
              <li key={shape}>
                <span className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-2 py-1 font-mono text-xs">
                  {shape}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">
            No shape available.
          </p>
        )}
      </div>
    </div>
  );
}
