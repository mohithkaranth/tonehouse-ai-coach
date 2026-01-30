import { CHROMATIC_NOTES } from "@/lib/music";
import type { NoteName } from "./types";

const guitarStrings = ["E", "A", "D", "G", "B", "E"] as const;
const bassStrings = ["E", "A", "D", "G"] as const;

interface FretboardProps {
  scaleNotes: NoteName[];
  instrument: "Guitar" | "Bass";
}

function buildLine(openNote: NoteName, scaleNotes: NoteName[]) {
  const openIndex = CHROMATIC_NOTES.indexOf(openNote);
  const frets = Array.from({ length: 13 }, (_, fret) => {
    const note = CHROMATIC_NOTES[(openIndex + fret) % CHROMATIC_NOTES.length];
    return scaleNotes.includes(note) ? note.padEnd(2, " ") : "--";
  });

  return frets.join(" ");
}

export default function Fretboard({ scaleNotes, instrument }: FretboardProps) {
  const strings = instrument === "Guitar" ? guitarStrings : bassStrings;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
      <p className="text-sm font-medium text-zinc-200">{instrument} fret positions (0–12)</p>
      <div className="mt-3 space-y-2 font-mono text-xs text-zinc-400">
        {strings.map((stringName) => (
          <div key={stringName} className="flex items-center gap-3">
            <span className="w-4 text-zinc-500">{stringName}</span>
            <span>{buildLine(stringName, scaleNotes)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
