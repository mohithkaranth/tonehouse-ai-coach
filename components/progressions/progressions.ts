import { buildDiatonicChords, spellDiatonicNote, transposeNote, type NoteName, type Tonality } from "@/lib/music";
import type { LengthOption, ProgressionResult, StyleOption } from "./types";

export const PROGRESSION_TEMPLATES: Record<StyleOption, Record<LengthOption, string[][]>> = {
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
      ["ii7", "V7", "Imaj7", "V7/ii"],
      ["Imaj7", "vi7", "ii7", "V7"],
    ],
    8: [
      ["ii7", "V7", "Imaj7", "V7/ii", "ii7", "V7", "Imaj7", "V7"],
      ["Imaj7", "vi7", "ii7", "V7", "Imaj7", "V7/ii", "ii7", "V7"],
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

export const ALT_TEMPLATES: Record<StyleOption, Record<LengthOption, string[][]>> = {
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
      ["ii7", "V7", "Imaj7", "V7/V"],
      ["Imaj7", "V7/ii", "ii7", "V7"],
    ],
    8: [
      ["ii7", "V7", "Imaj7", "V7/ii", "ii7", "V7", "Imaj7", "V7/V"],
      ["Imaj7", "V7/ii", "ii7", "V7", "Imaj7", "V7/V", "ii7", "V7"],
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

const DEGREES = ["I", "II", "III", "IV", "V", "VI", "VII"];

const TRIAD_SUFFIXES = { Major: "", Minor: "m", Diminished: "dim" } as const;
const SEVENTHS = {
  Major: ["maj7", "m7", "m7", "maj7", "7", "m7", "m7b5"],
  Minor: ["m7", "m7b5", "maj7", "m7", "m7", "maj7", "7"],
} as const;

export function buildProgression(root: NoteName, tonality: Tonality, romanNumerals: string[]): ProgressionResult {
  const diatonic = buildDiatonicChords(root, tonality);
  const names = diatonic.map((chord, degree) => spellDiatonicNote(root, chord.root, degree));
  const resolved = romanNumerals.map((token) => {
    // Older saved jazz templates wrote the dominant of ii as VI7.
    const roman = token === "VI7" ? "V7/ii" : token;
    const [symbol, target] = roman.split("/");
    if (target) {
      const degree = DEGREES.indexOf(target.toUpperCase());
      if (degree < 0 || !["V", "V7"].includes(symbol)) throw new Error("Invalid secondary dominant");
      const dominant = spellDiatonicNote(names[degree], transposeNote(diatonic[degree].root, 7), 4);
      return { roman, chord: dominant + (symbol === "V7" ? "7" : "") };
    }

    const match = /^([IViv]+)(maj7|[ø°]?7|°)?$/.exec(symbol);
    const degree = match ? DEGREES.indexOf(match[1].toUpperCase()) : -1;
    if (!match || degree < 0) throw new Error("Invalid Roman numeral");

    const chord = diatonic[degree];
    if (!symbol.endsWith("7")) {
      return { roman: chord.numeral, chord: names[degree] + TRIAD_SUFFIXES[chord.type] };
    }

    // V7 supplies the raised leading tone in minor. Major blues uses dominant I and IV.
    if (symbol === "V7" || (tonality === "Major" && ["I7", "IV7"].includes(symbol))) {
      return { roman: symbol, chord: names[degree] + "7" };
    }

    const suffix = SEVENTHS[tonality][degree];
    const baseNumeral = chord.numeral.replace("°", "");
    const extension = suffix === "m7b5" ? "ø7" : suffix === "maj7" ? "maj7" : "7";
    return { roman: baseNumeral + extension, chord: names[degree] + suffix };
  });

  return {
    romanNumerals: resolved.map((chord) => chord.roman),
    chords: resolved.map((chord) => chord.chord),
  };
}
