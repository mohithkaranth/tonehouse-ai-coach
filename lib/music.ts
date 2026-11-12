export const CHROMATIC_NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export type NoteName = (typeof CHROMATIC_NOTES)[number];

export const CHORD_INTERVALS = {
  Major: [0, 4, 7],
  Minor: [0, 3, 7],
  "Dominant 7": [0, 4, 7, 10],
  "Major 7": [0, 4, 7, 11],
  "Minor 7": [0, 3, 7, 10],
  Sus2: [0, 2, 7],
  Sus4: [0, 5, 7],
  Diminished: [0, 3, 6],
  Augmented: [0, 4, 8],
} as const;

export const SCALE_INTERVALS = {
  "Major (Ionian)": [0, 2, 4, 5, 7, 9, 11],
  "Natural Minor (Aeolian)": [0, 2, 3, 5, 7, 8, 10],
  "Pentatonic Major": [0, 2, 4, 7, 9],
  "Pentatonic Minor": [0, 3, 5, 7, 10],
  Blues: [0, 3, 5, 6, 7, 10],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
} as const;

export type ChordType = keyof typeof CHORD_INTERVALS;
export type ScaleType = keyof typeof SCALE_INTERVALS;

export type Tonality = "Major" | "Minor";

const noteIndexMap = new Map(CHROMATIC_NOTES.map((note, index) => [note, index]));

function transpose(rootIndex: number, semitones: number) {
  return CHROMATIC_NOTES[(rootIndex + semitones) % CHROMATIC_NOTES.length];
}

export function transposeNote(root: NoteName, semitones: number) {
  const rootIndex = noteIndexMap.get(root);
  if (rootIndex == null) return root;
  return transpose(rootIndex, semitones);
}

const NOTE_LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;

export function spellDiatonicNote(root: string, note: NoteName, degreeOffset: number) {
  const rootLetter = NOTE_LETTERS.findIndex((letter) => root.startsWith(letter));
  const letter = NOTE_LETTERS[(rootLetter + degreeOffset) % NOTE_LETTERS.length];
  const alteration = (CHROMATIC_NOTES.indexOf(note) - CHROMATIC_NOTES.indexOf(letter) + 18) % 12 - 6;
  return letter + (alteration < 0 ? "b".repeat(-alteration) : "#".repeat(alteration));
}

export function buildChord(root: NoteName, type: ChordType) {
  const rootIndex = noteIndexMap.get(root);
  if (rootIndex == null) return [];

  return CHORD_INTERVALS[type].map((interval) => transpose(rootIndex, interval));
}

export function buildSpelledChord(root: NoteName, type: ChordType) {
  const degrees = [0, type === "Sus2" ? 1 : type === "Sus4" ? 3 : 2, 4, 6];
  return buildChord(root, type).map((note, index) => spellDiatonicNote(root, note, degrees[index]));
}

export function buildScale(root: NoteName, type: ScaleType) {
  const rootIndex = noteIndexMap.get(root);
  if (rootIndex == null) return [];

  return SCALE_INTERVALS[type].map((interval) => transpose(rootIndex, interval));
}

const TONALITY_SCALES: Record<Tonality, ScaleType> = {
  Major: "Major (Ionian)",
  Minor: "Natural Minor (Aeolian)",
};

const DIATONIC_TRIADS = {
  Major: ["Major", "Minor", "Minor", "Major", "Major", "Minor", "Diminished"],
  Minor: ["Minor", "Diminished", "Major", "Minor", "Minor", "Major", "Major"],
} as const satisfies Record<Tonality, readonly ChordType[]>;

const DIATONIC_NUMERALS: Record<Tonality, string[]> = {
  Major: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
  Minor: ["i", "ii°", "III", "iv", "v", "VI", "VII"],
};

export function buildDiatonicChords(root: NoteName, tonality: Tonality) {
  const scale = buildScale(root, TONALITY_SCALES[tonality]);
  return scale.map((note, index) => ({
    numeral: DIATONIC_NUMERALS[tonality][index],
    root: note,
    type: DIATONIC_TRIADS[tonality][index],
  }));
}
