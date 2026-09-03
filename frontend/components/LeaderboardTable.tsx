"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchLeaderboard, type GameMode, type LeaderboardEntry, type LeaderboardSort } from "@/lib/api";
import { countryFlag } from "@/lib/countryFlag";

const MODES: { value: GameMode; label: string }[] = [
  { value: 0, label: "std" },
  { value: 1, label: "taiko" },
  { value: 2, label: "catch" },
  { value: 3, label: "mania" },
];

export function LeaderboardTable() {
  const [mode, setMode] = useState<GameMode>(0);
  const [relax, setRelax] = useState(false);
  const [sort, setSort] = useState<LeaderboardSort>("performance");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchLeaderboard(mode, relax, sort)
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "failed to load leaderboard");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, relax, sort]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-extrabold">Leaderboard</h1>
      <p className="mt-1 text-neutral-400">
        osu! &middot; {sort === "performance" ? "performance" : "score"}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex gap-1 rounded-full bg-neutral-900 p-1">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                mode === m.value && !relax
                  ? "bg-osupink text-neutral-950"
                  : "text-neutral-300 hover:text-white"
              }`}
              disabled={relax}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 rounded-full bg-neutral-900 p-1">
          {MODES.map((m) => (
            <button
              key={`${m.value}-rx`}
              onClick={() => {
                setMode(m.value);
                setRelax(true);
              }}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                mode === m.value && relax
                  ? "bg-osupink text-neutral-950"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              {m.label} rx
            </button>
          ))}
        </div>

        <button
          onClick={() => setRelax(false)}
          className={`text-xs underline ${relax ? "text-osupink" : "invisible"}`}
        >
          back to vanilla
        </button>

        <div className="ml-auto flex gap-1 rounded-full bg-neutral-900 p-1">
          <button
            onClick={() => setSort("performance")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              sort === "performance" ? "bg-neutral-100 text-neutral-950" : "text-neutral-300 hover:text-white"
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setSort("score")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              sort === "score" ? "bg-neutral-100 text-neutral-950" : "text-neutral-300 hover:text-white"
            }`}
          >
            Score
          </button>
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      {!error && !loading && entries.length === 0 && (
        <p className="mt-12 text-center text-neutral-500">
          No scores yet. Launch osu! with <code className="rounded bg-neutral-900 px-1.5 py-0.5">-devserver</code>{" "}
          and set a play to appear here.
        </p>
      )}

      {entries.length > 0 && (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-xs uppercase tracking-wide text-neutral-500">
              <th className="py-2 pr-2">#</th>
              <th className="pr-2">Player</th>
              <th className="text-right">Accuracy</th>
              <th className="text-right">Play count</th>
              <th className="text-right">{sort === "performance" ? "Performance" : "Score"}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.user_id} className="border-b border-neutral-900 hover:bg-neutral-900/50">
                <td className="py-3 pr-2 font-semibold text-neutral-500">#{entry.rank}</td>
                <td className="pr-2">
                  <Link href={`/profile/${entry.user_id}`} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.avatar_url}
                      alt=""
                      className="h-9 w-9 rounded-full bg-neutral-800 object-cover"
                    />
                    <span className="flex items-center gap-1.5 font-medium">
                      <span>{countryFlag(entry.country)}</span>
                      {entry.username}
                    </span>
                  </Link>
                </td>
                <td className="text-right tabular-nums">{entry.accuracy.toFixed(2)}%</td>
                <td className="text-right tabular-nums">{entry.play_count.toLocaleString()}</td>
                <td className="text-right font-bold tabular-nums">
                  {sort === "performance"
                    ? `${entry.pp.toLocaleString(undefined, { maximumFractionDigits: 0 })}pp`
                    : entry.total_score.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
