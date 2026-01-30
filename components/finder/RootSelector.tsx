import { CHROMATIC_NOTES } from "@/lib/music";
import type { NoteName } from "./types";

interface RootSelectorProps {
  value: NoteName;
  onChange: (value: NoteName) => void;
}

export default function RootSelector({ value, onChange }: RootSelectorProps) {
  return (
    <div>
      <p className="text-sm font-medium text-zinc-200">Root note</p>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {CHROMATIC_NOTES.map((note) => (
          <button
            key={note}
            type="button"
            onClick={() => onChange(note)}
            className={`rounded-2xl border px-3 py-2 text-sm font-medium transition ${
              value === note
                ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
                : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
            }`}
          >
            {note}
          </button>
        ))}
      </div>
    </div>
  );
}
