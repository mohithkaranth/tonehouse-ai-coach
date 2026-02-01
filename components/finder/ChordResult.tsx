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

const noteOrder = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

function getBassShape(root: NoteName, tones: NoteName[]) {
  const rootIndex = noteOrder.indexOf(root);
  const fifth = tones[2] ?? tones[1] ?? root;
  const fifthIndex = noteOrder.indexOf(fifth);
  const rootFret = rootIndex >= noteOrder.indexOf("E") ? rootIndex - noteOrder.indexOf("E") : rootIndex + 12 - noteOrder.indexOf("E");
  const fifthFret = fifthIndex >= noteOrder.indexOf("A") ? fifthIndex - noteOrder.indexOf("A") : fifthIndex + 12 - noteOrder.indexOf("A");

  return `Root on E string fret ${rootFret}, fifth on A string fret ${fifthFret}`;
}

function buildInversions(tones: NoteName[]) {
  if (tones.length < 3) return [];
  const first = [...tones.slice(1), tones[0]];
  const second = tones.length > 3 ? [...tones.slice(2), tones[0], tones[1]] : [];
  return [first, second].filter((entry) => entry.length > 0);
}

function buildOctaveNotes(tones: NoteName[], baseOctave: number) {
  if (tones.length === 0) return [];
  let octave = baseOctave;
  let lastIndex = noteOrder.indexOf(tones[0]);

  return tones.map((note, index) => {
    const noteIndex = noteOrder.indexOf(note);
    if (index > 0 && noteIndex <= lastIndex) {
      octave += 1;
    }
    lastIndex = noteIndex;
    return `${note}${octave}`;
  });
}

interface ChordResultProps {
  root: NoteName;
  type: ChordType;
  instrument: Instrument;
  onTypeChange: (type: ChordType) => void;
}

export default function ChordResult({ root, type, instrument, onTypeChange }: ChordResultProps) {
  const tones = buildChord(root, type);
  const chordName = `${root} ${type}`;
  const tonesDisplay = tones.join("–");
  const shapes = GUITAR_SHAPES[`${root}|${type}`] ?? [];
  const inversions = buildInversions(tones);
  const [audioError, setAudioError] = useState<string | null>(null);

  const handlePlayChord = async () => {
    setAudioError(null);

    try {
      if (instrument === "Guitar") {
        await playChord(buildOctaveNotes(tones, 3), {
          arpeggiateMs: 40,
          durationSec: 1.6,
          type: "triangle",
          gain: 0.16,
        });
        return;
      }

      if (instrument === "Bass") {
        const fifth = tones[2] ?? tones[1] ?? tones[0];
        const bassNotes = buildOctaveNotes([tones[0], fifth], 2);
        await playChord(bassNotes, {
          durationSec: 1.2,
          type: "sine",
          gain: 0.22,
        });
        return;
      }

      await playChord(buildOctaveNotes(tones, 4), {
        durationSec: 1.5,
        type: "sine",
        gain: 0.16,
      });
    } catch (error) {
      setAudioError("Audio playback failed. Please check your browser sound settings.");
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Chord Finder</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">{chordName}</h2>
          <p className="mt-2 text-sm text-zinc-400">Chord tones: {tonesDisplay}</p>
        </div>
        <div className="min-w-[220px]">
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Chord type
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              value={type}
              onChange={(event) => onTypeChange(event.target.value as ChordType)}
              className="min-w-[160px] flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
            >
              {chordTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handlePlayChord}
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-100 transition hover:border-zinc-500"
            >
              ▶ Play {instrument} chord
            </button>
          </div>
          {audioError ? (
            <p className="mt-2 text-xs text-rose-400">{audioError}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {instrument === "Keyboards" ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
            <p className="text-sm font-medium text-zinc-200">Keyboard notes</p>
            <p className="mt-2 text-sm text-zinc-400">Play: {tonesDisplay}</p>
            {inversions.length > 0 && (
              <div className="mt-3 text-xs text-zinc-500">
                <p>Inversions:</p>
                <ul className="mt-1 space-y-1">
                  {inversions.map((entry, index) => (
                    <li key={entry.join("-")}>{`#${index + 1}: ${entry.join("–")}`}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
            <p className="text-sm font-medium text-zinc-200">{instrument} shapes</p>
            {instrument === "Bass" ? (
              <p className="mt-2 text-sm text-zinc-400">{getBassShape(root, tones)}</p>
            ) : shapes.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm text-zinc-400">
                {shapes.map((shape) => (
                  <li key={shape}>
                    <span className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-2 py-1 font-mono text-xs text-zinc-200">
                      {shape}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-zinc-400">No common shapes saved. Use chord tones above.</p>
            )}
            {instrument === "Guitar" && (
              <p className="mt-2 text-xs text-zinc-500">
                Shapes are listed low-to-high strings (E-A-D-G-B-E).
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
