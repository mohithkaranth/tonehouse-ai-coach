import type { ReactNode } from "react";
import type { ProgressionResult } from "./types";

type AltSuggestion = {
  romanNumerals: string[];
  chords: string[];
};

type ProgressionsOutputProps = {
  progression: ProgressionResult | null;
  altSuggestions: AltSuggestion[];
};

function OutputCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
        {title}
      </h3>
      <div className="mt-3 text-lg font-medium text-zinc-100">{children}</div>
    </div>
  );
}

export default function ProgressionsOutput({ progression, altSuggestions }: ProgressionsOutputProps) {
  if (!progression) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/20 p-10 text-center text-zinc-400">
        Select a key and style, then generate a progression to get started.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OutputCard title="Roman numerals">{progression.romanNumerals.join(" – ")}</OutputCard>
      <OutputCard title="Chords in key">{progression.chords.join(" – ")}</OutputCard>
      {altSuggestions.length ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Alt suggestions
          </h3>
          <div className="mt-4 space-y-4 text-sm text-zinc-200">
            {altSuggestions.map((alt, index) => (
              <div key={`${alt.romanNumerals.join("-")}-${index}`}>
                <p className="font-medium text-zinc-100">
                  {alt.romanNumerals.join(" – ")}
                </p>
                <p className="mt-1 text-zinc-400">{alt.chords.join(" – ")}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
