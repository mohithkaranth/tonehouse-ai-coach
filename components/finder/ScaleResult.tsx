import { buildScale } from "@/lib/music";
import type { Instrument, NoteName, ScaleType } from "./types";
import Fretboard from "./Fretboard";

const scaleTypes: ScaleType[] = [
  "Major (Ionian)",
  "Natural Minor (Aeolian)",
  "Pentatonic Major",
  "Pentatonic Minor",
  "Blues",
  "Dorian",
  "Mixolydian",
];

interface ScaleResultProps {
  root: NoteName;
  type: ScaleType;
  instrument: Instrument;
  onTypeChange: (type: ScaleType) => void;
}

export default function ScaleResult({ root, type, instrument, onTypeChange }: ScaleResultProps) {
  const notes = buildScale(root, type);
  const notesDisplay = notes.join("–");

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Scale Finder</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">{`${root} ${type}`}</h2>
          <p className="mt-2 text-sm text-zinc-400">Scale notes: {notesDisplay}</p>
        </div>
        <div className="min-w-[220px]">
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Scale type
          </label>
          <select
            value={type}
            onChange={(event) => onTypeChange(event.target.value as ScaleType)}
            className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
          >
            {scaleTypes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {instrument === "Keyboards" ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
            <p className="text-sm font-medium text-zinc-200">Keyboard notes</p>
            <p className="mt-2 text-sm text-zinc-400">Play ascending: {notesDisplay}</p>
            <p className="mt-2 text-xs text-zinc-500">Suggested fingering: 1-2-3-1-2-3-4-5</p>
          </div>
        ) : (
          <Fretboard scaleNotes={notes} instrument={instrument} />
        )}
      </div>
    </div>
  );
}
