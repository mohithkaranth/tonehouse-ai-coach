"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type FormState = {
  instrument: string;
  style: string;
  key: string;
  tempo: string; // keep as string to preserve "" (optional)
};

type Preset = {
  label: string;
  form: FormState;
};

type Favorite = {
  id: string;
  label: string;
  form: FormState;
  query: string;
  createdAt: number;
};

const PREFS_KEY = "tonehouse_backing_track_preferences";
const RECENTS_KEY = "tonehouse_backing_track_recent";
const FAVS_KEY = "tonehouse_backing_track_favorites";

const INSTRUMENTS = [
  { value: "guitar", label: "Guitar" },
  { value: "bass", label: "Bass" },
  { value: "piano", label: "Piano/Keys" },
  { value: "drums", label: "Drums" },
];

const STYLES = [
  { value: "blues", label: "Blues" },
  { value: "rock", label: "Rock" },
  { value: "funk", label: "Funk" },
  { value: "jazz", label: "Jazz" },
  { value: "metal", label: "Metal" },
  { value: "pop", label: "Pop" },
  { value: "ballad", label: "Ballad" },
  { value: "acoustic", label: "Acoustic" },
];

const KEYS = [
  "C",
  "Cm",
  "C#",
  "C#m",
  "Db",
  "Dbm",
  "D",
  "Dm",
  "D#",
  "D#m",
  "Eb",
  "Ebm",
  "E",
  "Em",
  "F",
  "Fm",
  "F#",
  "F#m",
  "Gb",
  "Gbm",
  "G",
  "Gm",
  "G#",
  "G#m",
  "Ab",
  "Abm",
  "A",
  "Am",
  "A#",
  "A#m",
  "Bb",
  "Bbm",
  "B",
  "Bm",
];

const PRESETS: Preset[] = [
  {
    label: "🎸 Blues in A (90 bpm)",
    form: { instrument: "guitar", style: "blues", key: "A", tempo: "90" },
  },
  {
    label: "🎸 Rock in E (120 bpm)",
    form: { instrument: "guitar", style: "rock", key: "E", tempo: "120" },
  },
  {
    label: "🎸 Funk in Am (100 bpm)",
    form: { instrument: "guitar", style: "funk", key: "Am", tempo: "100" },
  },
  {
    label: "🎸 Metal in Em (140 bpm)",
    form: { instrument: "guitar", style: "metal", key: "Em", tempo: "140" },
  },
  {
    label: "🎸 Jazz in Bb (swing)",
    form: { instrument: "guitar", style: "jazz", key: "Bb", tempo: "" },
  },
  {
    label: "🎸 Pop in C (100 bpm)",
    form: { instrument: "guitar", style: "pop", key: "C", tempo: "100" },
  },
];

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function normalizeTempoInput(v: string) {
  // allow empty
  if (!v) return "";
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return String(clamp(Math.round(n), 40, 240));
}

function makeId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function BackingTracksPage() {
  const [form, setForm] = useState<FormState>({
    instrument: "guitar",
    style: "blues",
    key: "A",
    tempo: "",
  });

  const [hydrated, setHydrated] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [anyTempo, setAnyTempo] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Build query based on current form
  function buildQuery(from: FormState) {
    // Optional “instrument-aware” nudges (kept light; no hard rules)
    const instrumentHints: Record<string, string[]> = {
      guitar: ["no lead guitar", "rhythm"],
      bass: ["bass backing track", "no bass"],
      piano: ["piano backing track", "instrumental"],
      drums: ["drumless", "practice"],
    };

    const hints = instrumentHints[from.instrument] ?? [];

    return [
      from.style,
      "backing track",
      "in",
      from.key,
      from.tempo ? `${from.tempo} bpm` : "",
      // keep your jazz swing special-case
      from.style === "jazz" && from.key === "Bb" && !from.tempo ? "swing" : "",
      // small hints last (don’t overpower query)
      ...hints.slice(0, 1),
    ]
      .filter(Boolean)
      .join(" ");
  }

  const query = useMemo(() => buildQuery(form), [form]);

  function openSearch(q: string) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      q
    )}`;
    window.open(url, "_blank");
  }

  function pushRecent(q: string) {
    setRecentSearches((prev) => {
      const filtered = prev.filter((x) => x !== q);
      return [q, ...filtered].slice(0, 8);
    });
  }

  function isFavoriteQuery(q: string) {
    return favorites.some((f) => f.query === q);
  }

  function toggleFavorite(label: string, f: FormState) {
    const q = buildQuery(f);

    setFavorites((prev) => {
      const exists = prev.find((x) => x.query === q);
      if (exists) return prev.filter((x) => x.query !== q);

      const fav: Favorite = {
        id: makeId(),
        label,
        form: f,
        query: q,
        createdAt: Date.now(),
      };
      return [fav, ...prev].slice(0, 20);
    });
  }

  async function copyQueryToClipboard(q: string) {
    try {
      await navigator.clipboard.writeText(q);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  function handleSearch() {
    pushRecent(query);
    openSearch(query);
  }

  function handlePresetClick(preset: Preset) {
    setForm(preset.form); // auto-fill the form
    const q = buildQuery(preset.form);
    pushRecent(q);
    openSearch(q);
  }

  function clearRecentSearches() {
    setRecentSearches([]);
    localStorage.removeItem(RECENTS_KEY);
  }

  function clearFavorites() {
    setFavorites([]);
    localStorage.removeItem(FAVS_KEY);
  }

  // Load saved preferences + recents + favorites + query params
  useEffect(() => {
    try {
      // 1) load from localStorage
      const prefs = localStorage.getItem(PREFS_KEY);
      const recents = localStorage.getItem(RECENTS_KEY);
      const favs = localStorage.getItem(FAVS_KEY);

      const storedForm = safeJsonParse<FormState>(prefs, form);
      const storedRecents = safeJsonParse<string[]>(recents, []);
      const storedFavs = safeJsonParse<Favorite[]>(favs, []);

      // 2) apply query params as highest priority (coach handoff)
      const params = new URLSearchParams(window.location.search);
      const qpInstrument = params.get("instrument");
      const qpStyle = params.get("style");
      const qpKey = params.get("key");
      const qpTempo = params.get("tempo");

      const nextForm: FormState = {
        instrument:
          qpInstrument && INSTRUMENTS.some((i) => i.value === qpInstrument)
            ? qpInstrument
            : storedForm.instrument,
        style: qpStyle && STYLES.some((s) => s.value === qpStyle) ? qpStyle : storedForm.style,
        key: qpKey && KEYS.includes(qpKey) ? qpKey : storedForm.key,
        tempo: qpTempo ? normalizeTempoInput(qpTempo) : storedForm.tempo,
      };

      setForm(nextForm);
      setRecentSearches(storedRecents);
      setFavorites(storedFavs);

      // Any-tempo toggle follows whether tempo exists
      setAnyTempo(!nextForm.tempo);
    } catch {
      // ignore bad data
    } finally {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save preferences
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(PREFS_KEY, JSON.stringify(form));
  }, [hydrated, form]);

  // Save recents
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recentSearches));
  }, [hydrated, recentSearches]);

  // Save favorites
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(FAVS_KEY, JSON.stringify(favorites));
  }, [hydrated, favorites]);

  // Keep tempo in sync with Any tempo toggle
  useEffect(() => {
    if (!hydrated) return;
    setForm((prev) => ({
      ...prev,
      tempo: anyTempo ? "" : prev.tempo || "90",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyTempo]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-block mb-6 text-sm text-zinc-400 hover:text-zinc-200 transition"
        >
          ← Back to home
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">
              🎶 Backing Track Finder
            </h1>
            <p className="mt-3 text-zinc-400">
              Find high-quality YouTube backing tracks by key, style and tempo.
            </p>
          </div>

          <button
            onClick={() => copyQueryToClipboard(query)}
            className="shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-200 hover:bg-zinc-900 transition"
            title="Copy query"
          >
            {copied ? "✅ Copied" : "📋 Copy query"}
          </button>
        </div>

        {/* Presets */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-300">Presets</h3>
            <span className="text-xs text-zinc-500">Auto-fills + opens YouTube</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PRESETS.map((p) => {
              const q = buildQuery(p.form);
              const fav = favorites.some((f) => f.query === q);

              return (
                <div
                  key={p.label}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 hover:bg-zinc-900 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <button onClick={() => handlePresetClick(p)} className="text-left flex-1">
                      <div className="text-sm text-zinc-100">{p.label}</div>
                      <div className="mt-1 text-xs text-zinc-500">{q}</div>
                    </button>

                    <button
                      onClick={() => toggleFavorite(p.label, p.form)}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-950 transition"
                      title={fav ? "Remove from favorites" : "Save to favorites"}
                    >
                      {fav ? "❤️" : "🤍"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <div className="mt-10 space-y-6">
          {/* Instrument */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Instrument</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INSTRUMENTS.map((i) => {
                const active = form.instrument === i.value;
                return (
                  <button
                    key={i.value}
                    onClick={() => setForm((prev) => ({ ...prev, instrument: i.value }))}
                    className={[
                      "rounded-2xl border px-4 py-3 text-sm transition",
                      active
                        ? "border-zinc-200 bg-zinc-50 text-black"
                        : "border-zinc-800 bg-zinc-900/40 text-zinc-200 hover:bg-zinc-900",
                    ].join(" ")}
                  >
                    {i.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style pills */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Style</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => {
                const active = form.style === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => setForm((prev) => ({ ...prev, style: s.value }))}
                    className={[
                      "rounded-full border px-4 py-2 text-sm transition",
                      active
                        ? "border-zinc-200 bg-zinc-50 text-black"
                        : "border-zinc-800 bg-zinc-900/40 text-zinc-200 hover:bg-zinc-900",
                    ].join(" ")}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Key</label>
            <select
              value={form.key}
              onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value }))}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
            >
              {KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-zinc-500">
              Tip: try <span className="text-zinc-300">A / Am</span> for blues/rock practice.
            </p>
          </div>

          {/* Tempo */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="block text-sm text-zinc-300">Tempo</label>
                <p className="text-xs text-zinc-500">Use “Any tempo” if you don’t care about BPM.</p>
              </div>

              <button
                onClick={() => setAnyTempo((v) => !v)}
                className="rounded-full border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-950 transition"
                title="Toggle any tempo"
              >
                {anyTempo ? "✅ Any tempo" : "🎯 Fixed BPM"}
              </button>
            </div>

            {!anyTempo && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={60}
                    max={200}
                    value={Number(form.tempo || 90)}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        tempo: normalizeTempoInput(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                  <div className="w-20 text-right text-sm text-zinc-200 tabular-nums">
                    {form.tempo || "90"} bpm
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {[70, 80, 90, 100, 110, 120, 140, 160].map((b) => (
                    <button
                      key={b}
                      onClick={() => setForm((prev) => ({ ...prev, tempo: String(b) }))}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/30 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-950 transition"
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1">
                    Or type a number (40–240)
                  </label>
                  <input
                    type="number"
                    value={form.tempo}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        tempo: normalizeTempoInput(e.target.value),
                      }))
                    }
                    placeholder="e.g. 90"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Query preview */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="text-xs text-zinc-500 mb-2">Search query</div>
            <div className="text-sm text-zinc-100 break-words">{query}</div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => copyQueryToClipboard(query)}
                className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-950 transition"
              >
                {copied ? "✅ Copied" : "📋 Copy"}
              </button>

              <button
                onClick={() => toggleFavorite("⭐ Custom", form)}
                className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-950 transition"
                title={isFavoriteQuery(query) ? "Remove from favorites" : "Save to favorites"}
              >
                {isFavoriteQuery(query) ? "❤️ Saved" : "🤍 Save"}
              </button>
            </div>
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="mt-2 w-full rounded-2xl bg-white text-black py-4 font-medium hover:bg-zinc-200 transition"
          >
            🔍 Find backing tracks on YouTube
          </button>

          {/* Favorites */}
          {favorites.length > 0 && (
            <div className="pt-8 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-zinc-300">Favorites</h3>
                <button
                  onClick={clearFavorites}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition"
                >
                  Clear
                </button>
              </div>

              <ul className="space-y-2">
                {favorites
                  .slice()
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((f) => (
                    <li key={f.id} className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => {
                          setForm(f.form);
                          pushRecent(f.query);
                          openSearch(f.query);
                        }}
                        className="text-left flex-1"
                      >
                        <div className="text-sm text-zinc-200">{f.label}</div>
                        <div className="mt-1 text-xs text-zinc-500">{f.query}</div>
                      </button>

                      <button
                        onClick={() => toggleFavorite(f.label, f.form)}
                        className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-950 transition"
                        title="Remove from favorites"
                      >
                        ❤️
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="pt-8 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-zinc-300">Recent searches</h3>

                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition"
                >
                  Clear
                </button>
              </div>

              <ul className="space-y-2">
                {recentSearches.map((q) => (
                  <li key={q} className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => openSearch(q)}
                      className="text-left text-sm text-zinc-400 hover:text-zinc-200 transition flex-1"
                    >
                      {q}
                    </button>

                    <button
                      onClick={() => {
                        // save “recent query” as a favorite (label generic)
                        toggleFavorite("⭐ Recent", formFromQueryFallback(q, form));
                      }}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm hover:bg-zinc-950 transition"
                      title="Save this as favorite"
                    >
                      🤍
                    </button>
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-xs text-zinc-500">
                Note: favorites save your selected filters; recents are just query strings.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

/**
 * Best-effort fallback: when saving a “recent” query, we don’t truly know its original form.
 * We store the current form so at least it reopens with your current filters.
 */
function formFromQueryFallback(_query: string, current: FormState): FormState {
  return { ...current };
}
