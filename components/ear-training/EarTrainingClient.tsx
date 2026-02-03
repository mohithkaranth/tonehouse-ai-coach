"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CHORD_INTERVALS,
  CHROMATIC_NOTES,
  buildDiatonicChords,
  type ChordType,
  type NoteName,
} from "@/lib/music";

type Mode = "intervals" | "chords" | "progressions";

type Difficulty = "beginner" | "intermediate";

type Instrument = "guitar" | "keyboard";

type IntervalOption = { label: string; semitones: number };

type ProgressionPattern = { label: string; degrees: number[] };

type IntervalQuestion = {
  mode: "intervals";
  root: NoteName;
  octave: number;
  interval: IntervalOption;
};

type ChordQuestion = {
  mode: "chords";
  root: NoteName;
  octave: number;
  quality: ChordType;
};

type ProgressionQuestion = {
  mode: "progressions";
  key: NoteName;
  pattern: ProgressionPattern;
};

type Question = IntervalQuestion | ChordQuestion | ProgressionQuestion;

type AnswerState = {
  selected: string | null;
  isCorrect: boolean | null;
};

const STORAGE_KEYS = {
  instrument: "tonehouse_ear_training_instrument",
  difficulty: "tonehouse_ear_training_difficulty",
} as const;

const INTERVAL_OPTIONS: Record<Difficulty, IntervalOption[]> = {
  beginner: [
    { label: "Unison", semitones: 0 },
    { label: "m2", semitones: 1 },
    { label: "M2", semitones: 2 },
    { label: "m3", semitones: 3 },
    { label: "M3", semitones: 4 },
    { label: "P4", semitones: 5 },
    { label: "P5", semitones: 7 },
    { label: "Octave", semitones: 12 },
  ],
  intermediate: [
    { label: "Unison", semitones: 0 },
    { label: "m2", semitones: 1 },
    { label: "M2", semitones: 2 },
    { label: "m3", semitones: 3 },
    { label: "M3", semitones: 4 },
    { label: "P4", semitones: 5 },
    { label: "Tritone", semitones: 6 },
    { label: "P5", semitones: 7 },
    { label: "m6", semitones: 8 },
    { label: "M6", semitones: 9 },
    { label: "m7", semitones: 10 },
    { label: "M7", semitones: 11 },
    { label: "Octave", semitones: 12 },
  ],
};

const CHORD_QUALITIES: Record<Difficulty, ChordType[]> = {
  beginner: ["Major", "Minor"],
  intermediate: ["Major", "Minor", "Diminished", "Augmented", "Dominant 7"],
};

const PROGRESSION_PATTERNS: Record<Difficulty, ProgressionPattern[]> = {
  beginner: [
    { label: "I–IV–V–I", degrees: [1, 4, 5, 1] },
    { label: "I–V–vi–IV", degrees: [1, 5, 6, 4] },
  ],
  intermediate: [
    { label: "ii–V–I", degrees: [2, 5, 1] },
    { label: "vi–IV–I–V", degrees: [6, 4, 1, 5] },
  ],
};

const NOTE_INDEX = new Map(
  CHROMATIC_NOTES.map((note, index) => [note, index])
);

const NATURAL_KEYS: NoteName[] = ["C", "D", "E", "F", "G", "A", "B"];

let toneLoader: Promise<any> | null = null;

declare global {
  interface Window {
    Tone?: any;
  }
}

function loadTone() {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Tone.js can only be loaded in the browser.")
    );
  }

  if (window.Tone) return Promise.resolve(window.Tone);
  if (toneLoader) return toneLoader;

  toneLoader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tone@14.8.49/build/Tone.js";
    script.async = true;
    script.onload = () => {
      if (window.Tone) {
        resolve(window.Tone);
      } else {
        reject(new Error("Tone.js failed to initialize."));
      }
    };
    script.onerror = () =>
      reject(new Error("Tone.js failed to load from CDN."));
    document.head.appendChild(script);
  });

  return toneLoader;
}

function readStorage<T>(key: string, fallback: T) {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(key);
  if (!stored) return fallback;
  return stored as T;
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function midiFromNote(note: NoteName, octave: number) {
  const index = NOTE_INDEX.get(note) ?? 0;
  return (octave + 1) * 12 + index;
}

function noteFromMidi(midi: number) {
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return { note: CHROMATIC_NOTES[noteIndex], octave };
}

function noteNameWithOctave(note: NoteName, octave: number) {
  return `${note}${octave}`;
}

function addSemitones(note: NoteName, octave: number, semitones: number) {
  const midi = midiFromNote(note, octave) + semitones;
  const { note: nextNote, octave: nextOctave } = noteFromMidi(midi);
  return noteNameWithOctave(nextNote, nextOctave);
}

function buildChordNotes(
  root: NoteName,
  octave: number,
  chordType: ChordType
) {
  const rootMidi = midiFromNote(root, octave);
  return CHORD_INTERVALS[chordType].map((interval) => {
    const { note, octave: targetOctave } = noteFromMidi(rootMidi + interval);
    return noteNameWithOctave(note, targetOctave);
  });
}

export default function EarTrainingClient() {
  const [mode, setMode] = useState<Mode>("intervals");
  const [instrument, setInstrument] = useState<Instrument>("guitar");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [question, setQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [answerState, setAnswerState] = useState<AnswerState>({
    selected: null,
    isCorrect: null,
  });

  const monoSynthRef = useRef<any>(null);
  const polySynthRef = useRef<any>(null);

  const intervalOptions = useMemo(
    () => INTERVAL_OPTIONS[difficulty],
    [difficulty]
  );
  const chordOptions = useMemo(
    () => CHORD_QUALITIES[difficulty],
    [difficulty]
  );
  const progressionOptions = useMemo(
    () => PROGRESSION_PATTERNS[difficulty],
    [difficulty]
  );

  useEffect(() => {
    setInstrument(readStorage(STORAGE_KEYS.instrument, "guitar"));
    setDifficulty(readStorage(STORAGE_KEYS.difficulty, "beginner"));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.instrument, instrument);
    }
  }, [instrument]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.difficulty, difficulty);
    }
  }, [difficulty]);

  useEffect(() => {
    setQuestion(null);
    setAnswerState({ selected: null, isCorrect: null });
    setScore({ correct: 0, total: 0 });
  }, [mode, difficulty]);

  const ensureMonoSynth = useCallback(async () => {
    const Tone = await loadTone();
    await Tone.start();

    if (!monoSynthRef.current) {
      monoSynthRef.current = new Tone.Synth({
        oscillator: {
          type: instrument === "guitar" ? "triangle" : "sine",
        },
        envelope: {
          attack: 0.02,
          decay: 0.12,
          sustain: 0.3,
          release: 0.8,
        },
      }).toDestination();
    } else {
      monoSynthRef.current.oscillator.type =
        instrument === "guitar" ? "triangle" : "sine";
    }

    return { Tone, synth: monoSynthRef.current };
  }, [instrument]);

  const ensurePolySynth = useCallback(async () => {
    const Tone = await loadTone();
    await Tone.start();

    if (!polySynthRef.current) {
      polySynthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: instrument === "guitar" ? "triangle" : "sine",
        },
        envelope: {
          attack: 0.02,
          decay: 0.12,
          sustain: 0.35,
          release: 0.9,
        },
      }).toDestination();
    } else {
      polySynthRef.current.set({
        oscillator: {
          type: instrument === "guitar" ? "triangle" : "sine",
        },
      });
    }

    return { Tone, synth: polySynthRef.current };
  }, [instrument]);

  const playNote = useCallback(
    async (noteName: string, duration = 0.8, startTime?: number) => {
      const { Tone, synth } = await ensureMonoSynth();
      const when = startTime ?? Tone.now();
      synth.triggerAttackRelease(noteName, duration, when);
    },
    [ensureMonoSynth]
  );

  const playInterval = useCallback(
    async (root: NoteName, semitones: number, octave: number) => {
      const { Tone } = await ensureMonoSynth();
      const now = Tone.now();
      const rootNote = noteNameWithOctave(root, octave);
      const targetNote = addSemitones(root, octave, semitones);
      await playNote(rootNote, 0.8, now);
      await playNote(targetNote, 0.8, now + 1);
    },
    [ensureMonoSynth, playNote]
  );

  const playChord = useCallback(
    async (root: NoteName, chordType: ChordType, octave: number) => {
      const { Tone, synth } = await ensurePolySynth();
      const chordNotes = buildChordNotes(root, octave, chordType);
      const now = Tone.now();
      synth.triggerAttackRelease(chordNotes, 1.2, now);
    },
    [ensurePolySynth]
  );

  const playProgression = useCallback(
    async (key: NoteName, pattern: ProgressionPattern) => {
      const { Tone, synth } = await ensurePolySynth();
      const chords = buildDiatonicChords(key, "Major");
      const now = Tone.now();

      pattern.degrees.forEach((degree, index) => {
        const chord = chords[degree - 1];
        if (!chord) return;
        const chordNotes = buildChordNotes(chord.root, 3, chord.type);
        synth.triggerAttackRelease(chordNotes, 1.1, now + index * 1.2);
      });
    },
    [ensurePolySynth]
  );

  const playQuestion = useCallback(
    async (nextQuestion: Question) => {
      if (nextQuestion.mode === "intervals") {
        await playInterval(
          nextQuestion.root,
          nextQuestion.interval.semitones,
          nextQuestion.octave
        );
        return;
      }

      if (nextQuestion.mode === "chords") {
        await playChord(
          nextQuestion.root,
          nextQuestion.quality,
          nextQuestion.octave
        );
        return;
      }

      await playProgression(nextQuestion.key, nextQuestion.pattern);
    },
    [playChord, playInterval, playProgression]
  );

  const generateQuestion = useCallback((): Question => {
    if (mode === "intervals") {
      const root = pickRandom(CHROMATIC_NOTES);
      const interval = pickRandom(intervalOptions);
      return {
        mode: "intervals",
        root,
        octave: 3,
        interval,
      };
    }

    if (mode === "chords") {
      const root = pickRandom(CHROMATIC_NOTES);
      const quality = pickRandom(chordOptions);
      return {
        mode: "chords",
        root,
        octave: 3,
        quality,
      };
    }

    const key = pickRandom(NATURAL_KEYS);
    const pattern = pickRandom(progressionOptions);
    return {
      mode: "progressions",
      key,
      pattern,
    };
  }, [mode, intervalOptions, chordOptions, progressionOptions]);

  const handleStart = useCallback(async () => {
    const nextQuestion = generateQuestion();
    setQuestion(nextQuestion);
    setAnswerState({ selected: null, isCorrect: null });
    await playQuestion(nextQuestion);
  }, [generateQuestion, playQuestion]);

  const handleReplay = useCallback(async () => {
    if (!question) return;
    await playQuestion(question);
  }, [question, playQuestion]);

  const handleNext = useCallback(async () => {
    const nextQuestion = generateQuestion();
    setQuestion(nextQuestion);
    setAnswerState({ selected: null, isCorrect: null });
    await playQuestion(nextQuestion);
  }, [generateQuestion, playQuestion]);

  const correctAnswer = useMemo(() => {
    if (!question) return null;
    if (question.mode === "intervals") return question.interval.label;
    if (question.mode === "chords") return question.quality;
    return question.pattern.label;
  }, [question]);

  const handleAnswer = (choice: string) => {
    if (!question || answerState.selected) return;
    const isCorrect = choice === correctAnswer;
    setAnswerState({ selected: choice, isCorrect });
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const choices = useMemo(() => {
    if (mode === "intervals")
      return intervalOptions.map((option) => option.label);
    if (mode === "chords") return chordOptions;
    return progressionOptions.map((option) => option.label);
  }, [mode, intervalOptions, chordOptions, progressionOptions]);

  return (
    <div className="mt-10 space-y-6">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "intervals", label: "Intervals" },
              { id: "chords", label: "Chord Quality" },
              { id: "progressions", label: "Progressions" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={
                mode === item.id
                  ? "rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900"
                  : "rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500"
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm text-zinc-400">
            <span>Instrument</span>
            <select
              value={instrument}
              onChange={(event) =>
                setInstrument(event.target.value as Instrument)
              }
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            >
              <option value="guitar">guitar</option>
              <option value="keyboard">keyboard</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-zinc-400">
            <span>Difficulty</span>
            <select
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as Difficulty)
              }
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            >
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
            </select>
          </label>

          <div className="flex flex-col justify-between gap-2 text-sm text-zinc-400">
            <span>Score</span>
            <span className="text-base text-zinc-100">
              {score.correct} / {score.total}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleStart}
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
          >
            Start
          </button>
          <button
            onClick={handleReplay}
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
          >
            Replay
          </button>
          <button
            onClick={handleNext}
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm"
          >
            Next
          </button>
        </div>

        <p className="mt-4 text-sm text-zinc-400">
          Press Start to hear a prompt. Choose the answer to score.
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-xl font-semibold text-zinc-100">
          {mode === "intervals" && "Identify the interval"}
          {mode === "chords" && "Identify the chord quality"}
          {mode === "progressions" && "Identify the progression"}
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          {question
            ? "Listen and pick the correct answer below."
            : "Start a round to hear the audio prompt."}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {choices.map((choice) => {
            const isSelected = answerState.selected === choice;
            return (
              <button
                key={choice}
                onClick={() => handleAnswer(choice)}
                className={
                  isSelected
                    ? "rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-900"
                    : "rounded-2xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-200 hover:border-zinc-600"
                }
              >
                {choice}
              </button>
            );
          })}
        </div>

        {answerState.selected && correctAnswer && (
          <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="text-sm text-zinc-200">
              {answerState.isCorrect ? "✅ Correct!" : "❌ Not quite."}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Correct answer: {correctAnswer}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h3 className="text-sm font-semibold text-zinc-200">Now playing</h3>
        <p className="mt-2 text-sm text-zinc-400">
          {question?.mode === "intervals" &&
            `Root: ${question.root}${question.octave}. Interval: ${question.interval.label}.`}
          {question?.mode === "chords" &&
            `Chord: ${question.root}${question.octave} ${question.quality}.`}
          {question?.mode === "progressions" &&
            `Key: ${question.key} major. Pattern: ${question.pattern.label}.`}
          {!question && "No prompt yet. Hit Start to begin."}
        </p>
      </div>
    </div>
  );
}
