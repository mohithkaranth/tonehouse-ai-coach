import type { Instrument } from "./types";

const instruments: Instrument[] = ["Guitar", "Bass", "Keyboards"];

interface InstrumentSelectorProps {
  value: Instrument;
  onChange: (value: Instrument) => void;
}

export default function InstrumentSelector({ value, onChange }: InstrumentSelectorProps) {
  return (
    <div>
      <p className="text-sm font-medium text-zinc-200">Instrument</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {instruments.map((instrument) => (
          <button
            key={instrument}
            type="button"
            onClick={() => onChange(instrument)}
            className={`rounded-2xl border px-3 py-2 text-sm font-medium transition ${
              value === instrument
                ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
                : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
            }`}
          >
            {instrument}
          </button>
        ))}
      </div>
    </div>
  );
}
