"use client";

import { useState } from "react";
import { useStoredPreference } from "@/lib/use-stored-preference";
import {
  CHROMATIC_NOTES,
  buildDiatonicChords,
  transposeNote,
  type ChordType,
  type NoteName,
  type Tonality,
} from "@/lib/music";
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

const PROGRESSION_TEMPLATES: Record<StyleOption, Record<LengthOption, string[][]>> = {
  Pop: {
    4: [
      ["I", "V", "vi", "IV"],
      ["vi", "IV", "I", "V"],
      ["I", "vi", "IV", "V"],
      ["I", "V", "IV", "V"],
    ],
    8: [
      ["I", "V", "vi", "IV", "I", "V", "vi", "IV"],
      ["I", "vi", "IV", "V", "I", "V", "IV", "V"],
      ["vi", "IV", "I", "V", "IV", "V", "I", "V"],
    ],
  },
  Rock: {
    4: [
      ["I", "IV", "V", "I"],
      ["I", "IV", "I", "V"],
      ["I", "V", "IV", "I"],
      ["vi", "IV", "I", "V"],
    ],
    8: [
      ["I", "IV", "V", "I", "I", "IV", "V", "I"],
      ["I", "V", "IV", "I", "vi", "IV", "V", "I"],
    ],
  },
  Blues: {
    4: [["I7", "IV7", "I7", "V7"]],
    8: [["I7", "IV7", "I7", "I7", "IV7", "IV7", "I7", "V7"]],
  },
  Jazz: {
    4: [
      ["ii7", "V7", "Imaj7", "Imaj7"],
      ["ii7", "V7", "Imaj7", "VI7"],
      ["Imaj7", "vi7", "ii7", "V7"],
    ],
    8: [
      ["ii7", "V7", "Imaj7", "VI7", "ii7", "V7", "Imaj7", "V7"],
      ["Imaj7", "vi7", "ii7", "V7", "Imaj7", "VI7", "ii7", "V7"],
    ],
  },
  Ballad: {
    4: [
      ["I", "vi", "IV", "V"],
      ["I", "V", "vi", "IV"],
      ["IV", "I", "V", "vi"],
    ],
    8: [
      ["I", "vi", "IV", "V", "I", "V", "vi", "IV"],
      ["IV", "I", "V", "vi", "IV", "V", "I", "V"],
    ],
  },
};

const ALT_TEMPLATES: Record<StyleOption, Record<LengthOption, string[][]>> = {
  Pop: {
    4: [
      ["I", "IV", "V", "I"],
      ["vi", "V", "IV", "I"],
    ],
    8: [
      ["I", "V", "vi", "IV", "IV", "V", "I", "V"],
      ["vi", "IV", "I", "V", "vi", "IV", "V", "I"],
    ],
  },
  Rock: {
    4: [
      ["I", "IV", "V", "IV"],
      ["I", "V", "IV", "V"],
    ],
    8: [
      ["I", "IV", "I", "V", "I", "IV", "V", "I"],
      ["vi", "IV", "I", "V", "I", "IV", "V", "I"],
    ],
  },
  Blues: {
    4: [["I7", "IV7", "V7", "I7"]],
    8: [["I7", "IV7", "I7", "V7", "IV7", "IV7", "I7", "V7"]],
  },
  Jazz: {
    4: [
      ["ii7", "V7", "Imaj7", "V/V"],
      ["Imaj7", "VI7", "ii7", "V7"],
    ],
    8: [
      ["ii7", "V7", "Imaj7", "VI7", "ii7", "V7", "Imaj7", "V/V"],
      ["Imaj7", "VI7", "ii7", "V7", "Imaj7", "V/V", "ii7", "V7"],
    ],
  },
  Ballad: {
    4: [
      ["I", "V", "IV", "I"],
      ["vi", "IV", "I", "V"],
    ],
    8: [
      ["I", "V", "vi", "IV", "I", "V", "IV", "I"],
      ["vi", "IV", "I", "V", "IV", "I", "V", "vi"],
    ],
  },
};

function formatChordName(root: NoteName, type: ChordType) {
  switch (type) {
    case "Major":
      return root;
    case "Minor":
      return `${root}m`;
    case "Diminished":
      return `${root}dim`;
    case "Dominant 7":
      return `${root}7`;
    case "Major 7":
      return `${root}maj7`;
    case "Minor 7":
      return `${root}m7`;
    default:
      return root;
  }
}

export default function ProgressionsClient() {
  const [root, setRoot] = useStoredPreference(STORAGE_KEYS.root, DEFAULTS.root);
  const [tonality, setTonality] = useStoredPreference(STORAGE_KEYS.tonality, DEFAULTS.tonality);
  const [style, setStyle] = useStoredPreference(STORAGE_KEYS.style, DEFAULTS.style);
  const [storedLength, setStoredLength] = useStoredPreference(STORAGE_KEYS.length, DEFAULTS.length.toString());
  const [storedProgression, saveProgression] = useStoredPreference<string>(STORAGE_KEYS.last, "");
  const [templateIndex, setTemplateIndex] = useState(0);
  const length: LengthOption = storedLength === "8" ? 8 : 4;
  const diatonicLookup = new Map(
    buildDiatonicChords(root, tonality).map((entry) => [entry.numeral.replace("°", "").toLowerCase(), entry]),
  );

  const resolveRoman = (roman: string) => {
    const romanLower = roman.toLowerCase();

    if (roman.includes("/")) {
      const [, targetNumeral = ""] = roman.split("/");
      const targetBase = targetNumeral.replace(/maj7|m7|7/gi, "").replace(/°/g, "");
      const targetKey = targetBase.replace(/[^IViv]/g, "").toLowerCase();
      const targetEntry = diatonicLookup.get(targetKey);
      const targetRoot = targetEntry?.root ?? root;
      const secondaryRoot = transposeNote(targetRoot, 7);
      const overrideType: ChordType = romanLower.includes("maj7")
        ? "Major 7"
        : romanLower.includes("m7")
        ? "Minor 7"
        : "Dominant 7";
      return {
        roman,
        chord: formatChordName(secondaryRoot, overrideType),
      };
    }

    const overrideType: ChordType | null = romanLower.includes("maj7")
      ? "Major 7"
      : romanLower.includes("m7")
      ? "Minor 7"
      : romanLower.includes("7")
      ? "Dominant 7"
      : null;

    const baseNumeral = roman.replace(/maj7|m7|7/gi, "").replace(/°/g, "");
    const baseKey = baseNumeral.replace(/[^IViv]/g, "").toLowerCase();
    const entry = diatonicLookup.get(baseKey);
    const rootNote = entry?.root ?? root;
    const chordType = overrideType ?? entry?.type ?? "Major";

    return {
      roman,
      chord: formatChordName(rootNote, chordType),
    };
  };

  const buildProgression = (romanNumerals: string[]): ProgressionResult => {
    const resolved = romanNumerals.map(resolveRoman);
    return {
      romanNumerals: resolved.map((item) => item.roman),
      chords: resolved.map((item) => item.chord),
    };
  };

  let progression: ProgressionResult | null = null;
  if (storedProgression) {
    try {
      const stored: ProgressionResult = JSON.parse(storedProgression);
      if (Array.isArray(stored?.romanNumerals) && stored.romanNumerals.every((item) => typeof item === "string" && item.length > 0)) {
        progression = buildProgression(stored.romanNumerals);
      }
    } catch {
      // Ignore invalid saved data.
    }
  }

  function generateProgression(next = false) {
    const templates = PROGRESSION_TEMPLATES[style][length];
    const index = next ? (templateIndex + 1) % templates.length : templateIndex;
    setTemplateIndex(index);
    saveProgression(JSON.stringify(buildProgression(templates[index])));
  }

  const altSuggestions = progression ? ALT_TEMPLATES[style][length].slice(0, 2).map(buildProgression) : [];

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
