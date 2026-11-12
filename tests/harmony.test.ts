import { describe, expect, it } from "vitest";
import { ALT_TEMPLATES, buildProgression, PROGRESSION_TEMPLATES } from "@/components/progressions/progressions";
import { getGuitarShape } from "@/lib/guitar-shapes";
import { buildChord, buildSpelledChord, CHORD_INTERVALS, CHROMATIC_NOTES, transposeNote, type ChordType, type NoteName } from "@/lib/music";

const standardTuning: NoteName[] = ["E", "A", "D", "G", "B", "E"];

function playedNotes(shape: string) {
  const frets = shape.includes(" ") ? shape.split(" ") : [...shape];
  expect(frets).toHaveLength(6);
  expect(frets.every((fret) => /^(?:x|\d+)$/.test(fret))).toBe(true);
  return new Set(frets.flatMap((fret, string) =>
    fret === "x" ? [] : [transposeNote(standardTuning[string], Number(fret))]));
}

describe("guitar chord shapes", () => {
  it("gives C and G sus2 their second and excludes their third", () => {
    expect(playedNotes(getGuitarShape("C", "Sus2"))).toEqual(new Set(["C", "D", "G"]));
    expect(playedNotes(getGuitarShape("G", "Sus2"))).toEqual(new Set(["G", "A", "D"]));
  });

  it("spells chord tones by their musical function", () => {
    expect(buildSpelledChord("C", "Minor")).toEqual(["C", "Eb", "G"]);
    expect(buildSpelledChord("C", "Dominant 7")).toEqual(["C", "E", "G", "Bb"]);
    expect(buildSpelledChord("G", "Sus2")).toEqual(["G", "A", "D"]);
  });

  const qualities = Object.keys(CHORD_INTERVALS) as ChordType[];
  it.each(CHROMATIC_NOTES)("matches all nine advertised chord qualities for %s", (root) => {
    for (const quality of qualities) {
      expect(playedNotes(getGuitarShape(root, quality)), `${root} ${quality}`).toEqual(new Set(buildChord(root, quality)));
    }
  });
});

describe("chord progressions", () => {
  const firstJazz = PROGRESSION_TEMPLATES.Jazz[4][0];

  it("uses a minor ii7 in major and half-diminished ii with a minor tonic in minor", () => {
    expect(buildProgression("C", "Major", firstJazz)).toEqual({
      romanNumerals: ["ii7", "V7", "Imaj7", "Imaj7"],
      chords: ["Dm7", "G7", "Cmaj7", "Cmaj7"],
    });
    expect(buildProgression("C", "Minor", firstJazz)).toEqual({
      romanNumerals: ["iiø7", "V7", "i7", "i7"],
      chords: ["Dm7b5", "G7", "Cm7", "Cm7"],
    });
  });

  it("preserves the C major pop loop and shows the correct C minor numerals", () => {
    const firstPop = PROGRESSION_TEMPLATES.Pop[4][0];
    expect(buildProgression("C", "Major", firstPop).chords).toEqual(["C", "G", "Am", "F"]);
    expect(buildProgression("C", "Minor", firstPop)).toEqual({
      romanNumerals: ["i", "v", "VI", "iv"],
      chords: ["Cm", "Gm", "Ab", "Fm"],
    });
  });

  it("labels applied dominants accurately and corrects legacy saved jazz progressions", () => {
    expect(buildProgression("C", "Major", ["VI7", "ii7", "V/V", "V7/V"])).toEqual({
      romanNumerals: ["V7/ii", "ii7", "V/V", "V7/V"],
      chords: ["A7", "Dm7", "D", "D7"],
    });
  });

  it.each(CHROMATIC_NOTES)("resolves every main and alternate template for %s major and minor", (root) => {
    expect(buildProgression(root, "Major", firstJazz).chords[0]).toMatch(/m7$/);
    expect(buildProgression(root, "Minor", firstJazz).chords[0]).toMatch(/m7b5$/);
    expect(buildProgression(root, "Minor", firstJazz).chords[2]).toBe(root + "m7");
    for (const tonality of ["Major", "Minor"] as const) {
      for (const table of [PROGRESSION_TEMPLATES, ALT_TEMPLATES]) {
        for (const style of Object.values(table)) {
          for (const length of [4, 8] as const) {
            for (const template of style[length]) {
              const result = buildProgression(root, tonality, template);
              expect(result.romanNumerals).toHaveLength(length);
              expect(result.chords).toHaveLength(length);
              expect(result.chords.every((chord) => /^[A-G](?:#{1,2}|b{1,2})?(?:m7b5|maj7|m7|m|dim|7)?$/.test(chord))).toBe(true);
            }
          }
        }
      }
    }
  });
});
