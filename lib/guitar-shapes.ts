import { CHROMATIC_NOTES, type ChordType, type NoteName } from "./music";

const COMMON_SHAPES: Record<string, string> = {
  "C|Major": "x32010",
  "G|Major": "320003",
  "D|Major": "xx0232",
  "A|Major": "x02220",
  "E|Major": "022100",

  "C|Minor": "x35543",
  "D|Minor": "xx0231",
  "E|Minor": "022000",
  "A|Minor": "x02210",
  "G|Minor": "355333",

  "C|Dominant 7": "x35353",
  "G|Dominant 7": "320001",
  "D|Dominant 7": "xx0212",
  "A|Dominant 7": "x02020",
  "E|Dominant 7": "020100",

  "C|Major 7": "x32000",
  "G|Major 7": "320002",
  "D|Major 7": "xx0222",
  "A|Major 7": "x02120",
  "E|Major 7": "021100",

  "D|Minor 7": "xx0211",
  "A|Minor 7": "x02010",
  "E|Minor 7": "022030",
  "G|Minor 7": "353333",

  "C|Sus2": "x30033",
  "D|Sus2": "xx0230",
  "G|Sus2": "3x0233",
  "A|Sus2": "x02200",

  "C|Sus4": "x33011",
  "D|Sus4": "xx0233",
  "G|Sus4": "330013",
  "A|Sus4": "x02230",
};

// Movable voicings use the same six-string ordering as the displayed fingerings.
const MOVABLE_SHAPES: Record<ChordType, { root: NoteName; frets: string }> = {
  Major: { root: "E", frets: "022100" },
  Minor: { root: "E", frets: "022000" },
  "Dominant 7": { root: "E", frets: "020100" },
  "Major 7": { root: "E", frets: "021100" },
  "Minor 7": { root: "E", frets: "020000" },
  Sus2: { root: "A", frets: "x02200" },
  Sus4: { root: "E", frets: "022200" },
  Diminished: { root: "E", frets: "xx2353" },
  Augmented: { root: "E", frets: "xx2110" },
};

export function getGuitarShape(root: NoteName, type: ChordType) {
  const common = COMMON_SHAPES[`${root}|${type}`];
  if (common) return common;

  const { root: shapeRoot, frets } = MOVABLE_SHAPES[type];
  const offset = (CHROMATIC_NOTES.indexOf(root) - CHROMATIC_NOTES.indexOf(shapeRoot) + 12) % 12;
  const positions = [...frets].map((fret) => fret === "x" ? "x" : String(Number(fret) + offset));
  return positions.join(positions.some((position) => position.length > 1) ? " " : "");
}
