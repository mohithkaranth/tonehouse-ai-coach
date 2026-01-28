import fs from "fs";
import path from "path";

const lessonsDir = path.join(process.cwd(), "data", "lessons");

export type Lesson = {
  id: string;
  instrument?: string;
  order?: number;
  title: string;
  summary?: string;
  practice?: string[];
};

function parseLessonNumber(id: string): number | null {
  // lesson-001 -> 1, lesson-12 -> 12
  const m = String(id).match(/(\d+)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

export function getLesson(id: string): Lesson {
  const filePath = path.join(lessonsDir, `${id}.json`);
  if (!fs.existsSync(filePath)) throw new Error(`Lesson not found: ${id}`);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function listLessons(): Lesson[] {
  if (!fs.existsSync(lessonsDir)) return [];

  const lessons: Lesson[] = fs
    .readdirSync(lessonsDir)
    .filter((f) => f.toLowerCase().endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(lessonsDir, f), "utf-8")));

  lessons.sort((a, b) => {
    // 1) order (if present)
    const ao = typeof a.order === "number" ? a.order : null;
    const bo = typeof b.order === "number" ? b.order : null;
    if (ao !== null && bo !== null && ao !== bo) return ao - bo;
    if (ao !== null && bo === null) return -1;
    if (ao === null && bo !== null) return 1;

    // 2) numeric part from id (lesson-001)
    const an = parseLessonNumber(a.id);
    const bn = parseLessonNumber(b.id);
    if (an !== null && bn !== null && an !== bn) return an - bn;
    if (an !== null && bn === null) return -1;
    if (an === null && bn !== null) return 1;

    // 3) fallback string sort
    return String(a.id).localeCompare(String(b.id));
  });

  return lessons;
}

export function listLessonsByInstrument(instrument: string): Lesson[] {
  return listLessons().filter(
    (l) => (l.instrument || "").toLowerCase() === instrument.toLowerCase()
  );
}

export function getPrevNextLessonId(currentLessonId: string): {
  prevId: string | null;
  nextId: string | null;
} {
  const lessons = listLessons();
  const idx = lessons.findIndex((l) => l.id === currentLessonId);

  if (idx === -1) return { prevId: null, nextId: null };

  return {
    prevId: idx > 0 ? lessons[idx - 1].id : null,
    nextId: idx < lessons.length - 1 ? lessons[idx + 1].id : null,
  };
}
