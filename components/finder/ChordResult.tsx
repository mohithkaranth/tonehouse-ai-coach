"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
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

function noteToMidi(note: NoteName, octave: number) {
  return octave * 12 + noteOrder.indexOf(note);
}

function buildAscendingNotes(noteNames: NoteName[], baseOctave: number) {
  if (noteNames.length === 0) return [] as string[];
  const notes: string[] = [];
  let prevMidi = noteToMidi(noteNames[0], baseOctave);
  notes.push(`${noteNames[0]}${baseOctave}`);

  for (const note of noteNames.slice(1)) {
    let octave = baseOctave;
    let midi = noteToMidi(note, octave);
    while (midi <= prevMidi) {
      octave += 1;
      midi = noteToMidi(note, octave);
    }
    notes.push(`${note}${octave}`);
    prevMidi = midi;
  }

  return notes;
}

function buildInstrumentVoicing(tones: NoteName[], instrument: Instrument) {
  const rootTone = tones[0];
  const thirdTone = tones[1] ?? rootTone;
  const fifthTone = tones[2] ?? thirdTone;
  const seventhTone = tones[3];

  if (instrument === "Bass") {
    const bassFifth = fifthTone ?? rootTone;
    return buildAscendingNotes([rootTone, bassFifth], 2);
  }

  if (instrument === "Piano / Keys") {
    const pattern = seventhTone
      ? [rootTone, thirdTone, fifthTone, seventhTone]
      : [rootTone, thirdTone, fifthTone, rootTone];
    return buildAscendingNotes(pattern, 3);
  }

  const pattern = seventhTone
    ? [rootTone, thirdTone, fifthTone, seventhTone, thirdTone]
    : [rootTone, thirdTone, fifthTone, rootTone, thirdTone];
  return buildAscendingNotes(pattern, 3);
}

function getBassShape(root: NoteName, tones: NoteName[]) {
  const rootIndex = noteOrder.indexOf(root);
  const fifth = tones[2] ?? tones[1] ?? root;
  const fifthIndex = noteOrder.indexOf(fifth);
  const rootFret =
    rootIndex >= noteOrder.indexOf("E")
      ? rootIndex - noteOrder.indexOf("E")
      : rootIndex + 12 - noteOrder.indexOf("E");
  const fifthFret =
    fifthIndex >= noteOrder.indexOf("A")
      ? fifthIndex - noteOrder.indexOf("A")
      : fifthIndex + 12 - noteOrder.indexOf("A");

  return `Root on E string fret ${rootFret}, fifth on A string fret ${fifthFret}`;
}

function buildInversions(tones: NoteName[]) {
  if (tones.length < 3) return [];
  const first = [...tones.slice(1), tones[0]];
  const second = tones.length > 3 ? [...tones.slice(2), tones[0], tones[1]] : [];
  return [first, second].filter((entry) => entry.length > 0);
}

interface ChordResultProps {
  root: NoteName;
  type: ChordType;
  instrument: Instrument;
  onTypeChange: (type: ChordType) => void;
}

export default function ChordResult({ root, type, instrument, onTypeChange }: ChordResultProps) {
  const tones = useMemo(() => buildChord(root, type), [root, type]);
  const chordName = `${root} ${type}`;
  const tonesDisplay = tones.join("–");
  const shapes = GUITAR_SHAPES[`${root}|${type}`] ?? [];
  const inversions = buildInversions(tones);
  const voicingNotes = useMemo(() => buildInstrumentVoicing(tones, instrument), [tones, instrument]);

  const guitarSynthRef = useRef<Tone.PolySynth<Tone.Synth> | null>(null);
  const pianoSynthRef = useRef<Tone.PolySynth<Tone.Synth> | null>(null);
  const bassSynthRef = useRef<Tone.MonoSynth | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    return () => {
      guitarSynthRef.current?.dispose();
      pianoSynthRef.current?.dispose();
      bassSynthRef.current?.dispose();
    };
  }, []);

  const ensureAudioReady = async () => {
    if (isReady) return;
    setIsLoading(true);
    await Tone.start();
    setIsReady(true);
    setIsLoading(false);
  };

  const getGuitarSynth = () => {
    if (!guitarSynthRef.current) {
      guitarSynthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: {
          attack: 0.005,
          decay: 0.6,
          sustain: 0,
          release: 0.5,
        },
      }).toDestination();
    }
    return guitarSynthRef.current;
  };

  const getPianoSynth = () => {
    if (!pianoSynthRef.current) {
      pianoSynthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: {
          attack: 0.02,
          decay: 1.2,
          sustain: 0.4,
          release: 1.6,
        },
      }).toDestination();
    }
    return pianoSynthRef.current;
  };

  const getBassSynth = () => {
    if (!bassSynthRef.current) {
      bassSynthRef.current = new Tone.MonoSynth({
        oscillator: { type: "sine" },
        envelope: {
          attack: 0.01,
          decay: 0.3,
          sustain: 0.5,
          release: 1.1,
        },
      }).toDestination();
    }
    return bassSynthRef.current;
  };

  const handlePlay = async () => {
    await ensureAudioReady();

    const now = Tone.now();
    if (instrument === "Guitar") {
      const synth = getGuitarSynth();
      voicingNotes.forEach((note, index) => {
        synth.triggerAttackRelease(note, "2n", now + index * 0.04);
      });
      return;
    }

    if (instrument === "Piano / Keys") {
      const synth = getPianoSynth();
      synth.triggerAttackRelease(voicingNotes, "2n", now);
      return;
    }

    const synth = getBassSynth();
    voicingNotes.forEach((note) => {
      synth.triggerAttackRelease(note, "1n", now);
    });
  };

  const playLabel = isLoading ? "Loading audio..." : `▶ Play ${instrument} Chord`;

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Chord Finder</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">{chordName}</h2>
          <p className="mt-2 text-sm text-zinc-400">Chord tones: {tonesDisplay}</p>
          <p className="mt-2 text-xs text-zinc-500">Playback voicing: {voicingNotes.join("–")}</p>
        </div>
        <div className="min-w-[220px]">
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Chord type
          </label>
          <select
            value={type}
            onChange={(event) => onTypeChange(event.target.value as ChordType)}
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
          >
            {chordTypes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handlePlay}
            disabled={isLoading}
            className="mt-4 w-full rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/70 hover:text-emerald-100 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-900/60 disabled:text-zinc-500"
          >
            {playLabel}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {instrument === "Piano / Keys" ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
            <p className="text-sm font-medium text-zinc-200">Piano / keys notes</p>
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
