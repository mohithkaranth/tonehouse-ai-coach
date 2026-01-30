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

const noteIndexMap = new Map(CHROMATIC_NOTES.map((note, index) => [note, index]));

function transpose(rootIndex: number, semitones: number) {
  return CHROMATIC_NOTES[(rootIndex + semitones) % CHROMATIC_NOTES.length];
}

export function buildChord(root: NoteName, type: ChordType) {
  const rootIndex = noteIndexMap.get(root);
  if (rootIndex == null) return [];

  return CHORD_INTERVALS[type].map((interval) => transpose(rootIndex, interval));
}

export function buildScale(root: NoteName, type: ScaleType) {
  const rootIndex = noteIndexMap.get(root);
  if (rootIndex == null) return [];

  return SCALE_INTERVALS[type].map((interval) => transpose(rootIndex, interval));
}
