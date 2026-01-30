import type { FinderMode } from "./types";

const modes: FinderMode[] = ["Chords", "Scales"];

interface ModeTabsProps {
  value: FinderMode;
  onChange: (value: FinderMode) => void;
}

export default function ModeTabs({ value, onChange }: ModeTabsProps) {
  return (
    <div>
      <p className="text-sm font-medium text-zinc-200">Mode</p>
      <div className="mt-3 flex rounded-2xl border border-zinc-800 bg-zinc-900/40 p-1">
        {modes.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={`flex-1 rounded-2xl px-3 py-2 text-sm font-medium transition ${
              value === mode
                ? "bg-zinc-950 text-zinc-50"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
}
