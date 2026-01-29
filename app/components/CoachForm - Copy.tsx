"use client";

import { useMemo, useState } from "react";

type Mode = "practice_plan" | "warmups" | "chords" | "next_session";

type VideoRec = {
  title: string;
  url: string;
};

type PlanJSON = {
  instrument: string;
  mode: string;
  level: string;
  genre: string;
  goals: string;
  focusMetric: string;
  dayByDay: Array<{
    day: number;
    title: string;
    blocks: Array<{
      name: string;
      minutes: number;
      bullets: string[];
    }>;
  }>;
  notes?: string[];
};

type DebugInfo = {
  parseError?: string;
  raw?: string;
  planInstrument?: string;
  planMode?: string;
  reason?: string;
  firstMeaningfulLine?: string;
};

function planToMarkdown(plan: PlanJSON): string {
  const lines: string[] = [];
  lines.push(`# Instrument: ${plan.instrument}`);
  lines.push(``);
  lines.push(`**Mode:** ${plan.mode.replaceAll("_", " ")}`);
  lines.push(`**Level:** ${plan.level}`);
  lines.push(`**Genre:** ${plan.genre}`);
  lines.push(`**Goals:** ${plan.goals}`);
  lines.push(``);
  lines.push(`## Focus Metric`);
  lines.push(`- ${plan.focusMetric}`);
  lines.push(``);
  lines.push(`## Day-by-day plan`);
  for (const d of plan.dayByDay) {
    lines.push(`### Day ${d.day}: ${d.title}`);
    for (const b of d.blocks) {
      lines.push(`**${b.name} (${b.minutes} min)**`);
      for (const bullet of b.bullets) {
        lines.push(`- ${bullet}`);
      }
      lines.push(``);
    }
  }
  if (plan.notes?.length) {
    lines.push(`## Notes`);
    for (const n of plan.notes) lines.push(`- ${n}`);
  }
  return lines.join("\n");
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);

    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id.length === 11 ? id : null;
    }

    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v && v.length === 11) return v;

      const parts = u.pathname.split("/").filter(Boolean);
      const shortsIndex = parts.indexOf("shorts");
      if (shortsIndex >= 0 && parts[shortsIndex + 1]?.length === 11) {
        return parts[shortsIndex + 1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

function clientFallbackVideos(instrument: string): VideoRec[] {
  const x = (instrument || "").toLowerCase();

  if (x.includes("drum")) {
    return [
      { title: "Single Stroke Roll – Rudiment Lesson", url: "https://www.youtube.com/watch?v=KjpGoOq-0gc" },
      { title: "Practice Pad Warmup – Hands & Timing", url: "https://www.youtube.com/watch?v=nxM7i_GPars" },
    ];
  }

  if (x.includes("guitar")) {
    return [
      { title: "One Minute Changes – Faster Chord Switching", url: "https://www.youtube.com/watch?v=Ck73R_GjowE" },
      { title: "Strumming & Rhythm Control", url: "https://www.youtube.com/watch?v=9iVDuMN1BJA" },
    ];
  }

  if (x.includes("bass")) {
    return [
      { title: "Beginning The Major Scale (Bass Lesson)", url: "https://www.youtube.com/watch?v=2bvgAbWRdIA" },
      { title: "How To Practice Scales Like A Pro (Bass)", url: "https://www.youtube.com/watch?v=J7NxTxpklHY" },
    ];
  }

  if (x.includes("keyboard") || x.includes("keys") || x.includes("piano")) {
    return [
      { title: "Beginner Piano Practice Routine (Search)", url: "https://www.youtube.com/results?search_query=beginner+piano+practice+routine" },
      { title: "Piano Hand Independence Beginner (Search)", url: "https://www.youtube.com/results?search_query=piano+hand+independence+beginner" },
    ];
  }

  if (x.includes("vocal") || x.includes("sing")) {
    return [
      { title: "Vocal Warmups for Beginners (Search)", url: "https://www.youtube.com/results?search_query=vocal+warmups+for+beginners" },
      { title: "Breath Support Basics for Singing (Search)", url: "https://www.youtube.com/results?search_query=breath+support+basics+singing" },
    ];
  }

  return [
    { title: "How to practice music effectively (Search)", url: "https://www.youtube.com/results?search_query=how+to+practice+music+effectively" },
  ];
}

export default function CoachForm({
  instrument,
  onInstrumentChange,
}: {
  instrument: string;
  onInstrumentChange: (value: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("practice_plan");
  const [level, setLevel] = useState("Beginner");
  const [goals, setGoals] = useState("Improve timing and technique");
  const [genre, setGenre] = useState("Rock");
  const [timePerDay, setTimePerDay] = useState("30 minutes");
  const [daysPerWeek, setDaysPerWeek] = useState("5");
  const [lastSessionNotes, setLastSessionNotes] = useState("");

  const [resultMarkdown, setResultMarkdown] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<VideoRec[]>([]);

  const [serverReceived, setServerReceived] = useState<any>(null);
  const [apiVersion, setApiVersion] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  async function runCoach() {
    setLoading(true);
    setResultMarkdown("");
    setVideos([]);
    setServerReceived(null);
    setApiVersion("");
    setDebugInfo(null);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          instrument: (instrument || "").trim(),
          level,
          goals,
          genre,
          timePerDay,
          daysPerWeek,
          lastSessionNotes,
        }),
      });

      const data = await res.json();

      setApiVersion(data?.version || "");
      if (data?.received) setServerReceived(data.received);
      if (data?.debug) setDebugInfo(data.debug);

      // ✅ New API returns ok + plan
      if (data?.ok && data?.plan) {
        setResultMarkdown(planToMarkdown(data.plan as PlanJSON));
      } else {
        setResultMarkdown(data?.error || "No response.");
      }

      setVideos(Array.isArray(data?.videos) ? data.videos : []);
    } catch {
      setResultMarkdown("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const effectiveVideos = useMemo(() => {
    if (videos && videos.length > 0) return videos;
    return clientFallbackVideos(instrument);
  }, [videos, instrument]);

  const embedded = useMemo(() => {
    const items: { id: string; title: string; url: string }[] = [];
    for (const v of effectiveVideos) {
      const id = extractYouTubeId(v.url);
      if (id) items.push({ id, title: v.title, url: v.url });
    }
    return items.slice(0, 2);
  }, [effectiveVideos]);

  const field =
    "rounded-2xl border border-white/18 ring-1 ring-white/10 bg-zinc-950/55 px-4 py-3 text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:ring-2 focus:ring-white/20 focus:border-white/30 shadow-sm";

  return (
    <div className="grid gap-10">
      <div className="grid gap-6 md:grid-cols-3">
        <label className="grid gap-1 text-sm">
          <span className="text-zinc-400">Mode</span>
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} className={field}>
            <option value="practice_plan">Practice Plan</option>
            <option value="warmups">Warmups</option>
            <option value="chords">Grooves / Ideas</option>
            <option value="next_session">Next Session</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-zinc-400">Instrument</span>
          <select value={instrument} onChange={(e) => onInstrumentChange(e.target.value)} className={field}>
            <option value="Guitar">Guitar</option>
            <option value="Drums">Drums</option>
            <option value="Bass">Bass</option>
            <option value="Keyboards">Keyboards</option>
            <option value="Vocals">Vocals</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-zinc-400">Level</span>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className={field}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <label className="grid gap-1 text-sm">
          <span className="text-zinc-400">Genre</span>
          <input value={genre} onChange={(e) => setGenre(e.target.value)} className={field} />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-zinc-400">Time per day</span>
          <input value={timePerDay} onChange={(e) => setTimePerDay(e.target.value)} className={field} />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-zinc-400">Days per week</span>
          <input value={daysPerWeek} onChange={(e) => setDaysPerWeek(e.target.value)} className={field} />
        </label>
      </div>

      <label className="grid gap-1 text-sm">
        <span className="text-zinc-400">Goals</span>
        <textarea rows={3} value={goals} onChange={(e) => setGoals(e.target.value)} className={field} />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="text-zinc-400">Last session notes</span>
        <textarea rows={3} value={lastSessionNotes} onChange={(e) => setLastSessionNotes(e.target.value)} className={field} />
      </label>

      <button
        onClick={runCoach}
        disabled={loading}
        className="rounded-2xl bg-white/90 py-3 text-sm font-medium text-black transition hover:bg-white disabled:opacity-60 shadow"
      >
        {loading ? "Generating practice plan…" : "Generate Practice Plan"}
      </button>

      <div className="rounded-3xl border border-white/25 ring-1 ring-white/15 bg-zinc-950/55 p-6 shadow-inner">
        <div className="mb-3 text-xs uppercase tracking-widest text-zinc-500">Lesson Output</div>

        {apiVersion ? (
          <div className="mb-2 text-xs text-zinc-500">
            API version: <span className="text-zinc-300">{apiVersion}</span>
          </div>
        ) : null}

        {serverReceived?.instrument ? (
          <div className="mb-2 text-xs text-zinc-500">
            Server received:{" "}
            <span className="text-zinc-300">
              {serverReceived.instrument} / {serverReceived.mode} / {serverReceived.level} / {serverReceived.genre}
            </span>
          </div>
        ) : null}

        {debugInfo?.parseError || debugInfo?.raw ? (
          <div className="mb-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-4 text-xs text-zinc-400">
            <div className="text-zinc-300 font-medium mb-1">Debug</div>
            {debugInfo.parseError ? <div>parseError: <span className="text-zinc-200">{debugInfo.parseError}</span></div> : null}
            {debugInfo.raw ? (
              <div className="mt-2">
                raw (truncated):
                <pre className="mt-2 whitespace-pre-wrap text-zinc-300">{debugInfo.raw}</pre>
              </div>
            ) : null}
          </div>
        ) : null}

        <pre className="whitespace-pre-wrap text-zinc-100">{resultMarkdown || "Your structured lesson plan will appear here."}</pre>

        {resultMarkdown ? (
          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="mb-3 text-xs uppercase tracking-widest text-zinc-500">Recommended Videos</div>

            {embedded.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {embedded.map((v) => (
                  <div key={v.id} className="overflow-hidden rounded-2xl border border-white/18 bg-zinc-950/60">
                    <div className="px-4 py-3 text-sm text-zinc-200 border-b border-white/10">{v.title}</div>
                    <div className="aspect-video w-full">
                      <iframe
                        className="h-full w-full"
                        src={`https://www.youtube.com/embed/${v.id}`}
                        title={v.title}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                    <div className="px-4 py-3">
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-300 underline underline-offset-4 hover:text-white"
                      >
                        Open on YouTube ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
