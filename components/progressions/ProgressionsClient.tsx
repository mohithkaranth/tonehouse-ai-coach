"use client";

import { useState } from "react";
import { useStoredPreference } from "@/lib/use-stored-preference";
import {
  CHROMATIC_NOTES,
  type NoteName,
  type Tonality,
} from "@/lib/music";
import { ALT_TEMPLATES, buildProgression, PROGRESSION_TEMPLATES } from "./progressions";
import ProgressionsControls from "./ProgressionsControls";
import ProgressionsOutput from "./ProgressionsOutput";
import type { LengthOption, ProgressionResult, StyleOption } from "./types";

const STORAGE_KEYS = {
  root: "tonehouse_progressions_root",
  tonality: "tonehouse_progressions_tonality",
  style: "tonehouse_progressions_style",
  length: "tonehouse_progressions_length",
  last: "tonehouse_progressions_last",
} as const;

const DEFAULTS = {
  root: "C" as NoteName,
  tonality: "Major" as Tonality,
  style: "Pop" as StyleOption,
  length: 4 as LengthOption,
};

const STYLE_OPTIONS: { label: string; value: StyleOption }[] = [
  { label: "Pop", value: "Pop" },
  { label: "Rock", value: "Rock" },
  { label: "Blues", value: "Blues" },
  { label: "Jazz", value: "Jazz" },
  { label: "Ballad", value: "Ballad" },
];

const LENGTH_OPTIONS: { label: string; value: LengthOption }[] = [
  { label: "4 bars", value: 4 },
  { label: "8 bars", value: 8 },
];

export default function ProgressionsClient() {
  const [root, setRoot] = useStoredPreference(STORAGE_KEYS.root, DEFAULTS.root);
  const [tonality, setTonality] = useStoredPreference(STORAGE_KEYS.tonality, DEFAULTS.tonality);
  const [style, setStyle] = useStoredPreference(STORAGE_KEYS.style, DEFAULTS.style);
  const [storedLength, setStoredLength] = useStoredPreference(STORAGE_KEYS.length, DEFAULTS.length.toString());
  const [storedProgression, saveProgression] = useStoredPreference<string>(STORAGE_KEYS.last, "");
  const [templateIndex, setTemplateIndex] = useState(0);
  const length: LengthOption = storedLength === "8" ? 8 : 4;
  let progression: ProgressionResult | null = null;
  if (storedProgression) {
    try {
      const stored: ProgressionResult = JSON.parse(storedProgression);
      if (Array.isArray(stored?.romanNumerals) && stored.romanNumerals.every((item) => typeof item === "string" && item.length > 0)) {
        progression = buildProgression(root, tonality, stored.romanNumerals);
      }
    } catch {
      // Ignore invalid saved data.
    }
  }

  function generateProgression(next = false) {
    const templates = PROGRESSION_TEMPLATES[style][length];
    const index = next ? (templateIndex + 1) % templates.length : templateIndex;
    setTemplateIndex(index);
    saveProgression(JSON.stringify({ romanNumerals: templates[index] }));
  }

  const altSuggestions = progression ? ALT_TEMPLATES[style][length].slice(0, 2).map((template) => buildProgression(root, tonality, template)) : [];

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
      <ProgressionsControls
        root={root}
        tonality={tonality}
        style={style}
        length={length}
        roots={[...CHROMATIC_NOTES]}
        styles={STYLE_OPTIONS}
        lengths={LENGTH_OPTIONS}
        onRootChange={setRoot}
        onTonalityChange={setTonality}
        onStyleChange={(nextStyle) => {
          setStyle(nextStyle);
          setTemplateIndex(0);
        }}
        onLengthChange={(nextLength) => {
          setStoredLength(nextLength.toString());
          setTemplateIndex(0);
        }}
        onGenerate={() => generateProgression(false)}
        onRegenerate={() => generateProgression(true)}
        canRegenerate={Boolean(progression)}
      />

      <ProgressionsOutput progression={progression} altSuggestions={altSuggestions} />
    </div>
  );
}
