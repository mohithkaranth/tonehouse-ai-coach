import Link from "next/link";
import { listLessons } from "@/lib/lessons";

export default function LessonsIndexPage() {
  const lessons = listLessons();

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1>Lessons</h1>
      <p>Pick a lesson to start.</p>

      {lessons.length === 0 ? (
        <p>No lessons found in <code>data/lessons</code>.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {lessons.map((l) => (
            <Link
              key={l.id}
              href={`/lessons/${encodeURIComponent(l.id)}`}
              style={{
                display: "block",
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <strong>{l.title}</strong>
              {l.summary ? <div style={{ marginTop: 6 }}>{l.summary}</div> : null}
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                Open lesson →
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
