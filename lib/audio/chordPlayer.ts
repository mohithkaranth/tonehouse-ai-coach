type ChordPlayerOptions = {
  arpeggiateMs?: number;
  durationSec?: number;
  type?: "sine" | "triangle" | "sawtooth";
  gain?: number;
};

const NOTE_ORDER = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
const NOTE_INDEX = new Map<string, number>(NOTE_ORDER.map((note, index) => [note, index]));

let sharedAudioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") {
    throw new Error("AudioContext is only available in the browser.");
  }

  if (sharedAudioContext) return sharedAudioContext;

  const AudioContextConstructor = window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextConstructor) {
    throw new Error("Web Audio API is not supported in this browser.");
  }

  sharedAudioContext = new AudioContextConstructor();
  return sharedAudioContext;
}

async function unlockAudioContext(context: AudioContext) {
  if (context.state === "suspended") {
    await context.resume();
  }
}

function noteNameToFrequency(noteName: string) {
  const match = /^([A-G]#?)(-?\d+)$/.exec(noteName);
  if (!match) return null;
  const [, note, octaveRaw] = match;
  const index = NOTE_INDEX.get(note);
  if (index == null) return null;
  const octave = Number(octaveRaw);
  if (Number.isNaN(octave)) return null;
  const midiNumber = (octave + 1) * 12 + index;
  return 440 * Math.pow(2, (midiNumber - 69) / 12);
}

export async function playChord(noteNames: string[], options: ChordPlayerOptions = {}) {
  const context = getAudioContext();
  await unlockAudioContext(context);

  const validNotes = noteNames
    .map((note) => ({
      note,
      frequency: noteNameToFrequency(note),
    }))
    .filter((entry) => entry.frequency != null) as { note: string; frequency: number }[];

  if (validNotes.length === 0) {
    throw new Error("No valid notes provided for chord playback.");
  }

  const {
    arpeggiateMs = 0,
    durationSec = 1.4,
    type = "sine",
    gain = 0.18,
  } = options;

  const now = context.currentTime;
  const masterGain = context.createGain();
  masterGain.gain.value = gain;
  masterGain.connect(context.destination);

  validNotes.forEach((entry, index) => {
    const startOffset = arpeggiateMs > 0 ? (arpeggiateMs * index) / 1000 : 0;
    const startTime = now + startOffset;
    const endTime = startTime + durationSec;

    const oscillator = context.createOscillator();
    const noteGain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = entry.frequency;

    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(1, startTime + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, endTime);

    oscillator.connect(noteGain);
    noteGain.connect(masterGain);

    oscillator.start(startTime);
    oscillator.stop(endTime + 0.05);
  });
}

export type { ChordPlayerOptions };
