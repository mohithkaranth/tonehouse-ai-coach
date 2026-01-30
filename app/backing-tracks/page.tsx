"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type FormState = {
  instrument: string;
  style: string;
  key: string;
  tempo: string;
};

type Preset = {
  label: string;
  form: FormState;
};

const PREFS_KEY = "tonehouse_backing_track_preferences";
const RECENTS_KEY = "tonehouse_backing_track_recent";

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

export default function BackingTracksPage() {
  const [form, setForm] = useState<FormState>({
    instrument: "guitar",
    style: "blues",
    key: "A",
    tempo: "",
  });

  const [hydrated, setHydrated] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load saved preferences + recents
  useEffect(() => {
    try {
      const prefs = localStorage.getItem(PREFS_KEY);
      const recents = localStorage.getItem(RECENTS_KEY);

      if (prefs) setForm(JSON.parse(prefs));
      if (recents) setRecentSearches(JSON.parse(recents));
    } catch {
      // ignore bad data
    } finally {
      setHydrated(true);
    }
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

  function buildQuery(from: FormState) {
    return [
      from.instrument,
      from.style,
      "backing track",
      "in",
      from.key,
      from.tempo ? `${from.tempo} bpm` : "",
      from.style === "jazz" && from.key === "Bb" && !from.tempo ? "swing" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  function openSearch(query: string) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      query
    )}`;
    window.open(url, "_blank");
  }

  function pushRecent(query: string) {
    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q !== query);
      return [query, ...filtered].slice(0, 5);
    });
  }

  function handleSearch() {
    const query = buildQuery(form);
    pushRecent(query);
    openSearch(query);
  }

  function handlePresetClick(preset: Preset) {
    setForm(preset.form); // auto-fill the form
    const query = buildQuery(preset.form);
    pushRecent(query);
    openSearch(query);
  }

  function clearRecentSearches() {
    setRecentSearches([]);
    localStorage.removeItem(RECENTS_KEY);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-block mb-6 text-sm text-zinc-400 hover:text-zinc-200 transition"
        >
          ← Back to home
        </Link>

        <h1 className="text-4xl font-semibold tracking-tight">
          🎶 Backing Track Finder
        </h1>

        <p className="mt-3 text-zinc-400">
          Quickly find high-quality YouTube backing tracks by key, style and tempo.
        </p>

        {/* Presets */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-300">Presets</h3>
            <span className="text-xs text-zinc-500">Auto-fills + opens YouTube</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePresetClick(p)}
                className="text-left rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 hover:bg-zinc-900 transition"
              >
                <div className="text-sm text-zinc-100">{p.label}</div>
                <div className="mt-1 text-xs text-zinc-500">
                  {buildQuery(p.form)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="mt-10 space-y-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Instrument</label>
            <select
              value={form.instrument}
              onChange={(e) => setForm({ ...form, instrument: e.target.value })}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
            >
              <option value="guitar">Guitar</option>
              <option value="bass">Bass</option>
              <option value="piano">Piano</option>
              <option value="drums">Drums</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Style</label>
            <select
              value={form.style}
              onChange={(e) => setForm({ ...form, style: e.target.value })}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
            >
              <option value="blues">Blues</option>
              <option value="rock">Rock</option>
              <option value="jazz">Jazz</option>
              <option value="metal">Metal</option>
              <option value="funk">Funk</option>
              <option value="pop">Pop</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Key</label>
            <select
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
            >
              <option>A</option>
              <option>Am</option>
              <option>B</option>
              <option>Bm</option>
              <option>C</option>
              <option>Cm</option>
              <option>D</option>
              <option>Dm</option>
              <option>E</option>
              <option>Em</option>
              <option>F</option>
              <option>Fm</option>
              <option>G</option>
              <option>Gm</option>
              <option>Bb</option>
              <option>Bbm</option>
              <option>Eb</option>
              <option>Ebm</option>
              <option>Ab</option>
              <option>Abm</option>
              <option>Db</option>
              <option>Dbm</option>
              <option>Gb</option>
              <option>Gbm</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Tempo (optional)</label>
            <input
              type="number"
              value={form.tempo}
              onChange={(e) => setForm({ ...form, tempo: e.target.value })}
              placeholder="e.g. 90"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
            />
          </div>

          <button
            onClick={handleSearch}
            className="mt-4 w-full rounded-2xl bg-white text-black py-4 font-medium hover:bg-zinc-200 transition"
          >
            🔍 Find backing tracks on YouTube
          </button>

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="pt-6 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-zinc-300">
                  Recent searches
                </h3>

                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition"
                >
                  Clear
                </button>
              </div>

              <ul className="space-y-2">
                {recentSearches.map((query) => (
                  <li key={query}>
                    <button
                      onClick={() => openSearch(query)}
                      className="text-left text-sm text-zinc-400 hover:text-zinc-200 transition"
                    >
                      {query}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
