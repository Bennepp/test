"use client";

import { useEffect, useState } from "react";
import { fetchLeaderboard, type GameMode, type LeaderboardEntry } from "@/lib/api";

const MODES: { value: GameMode; label: string }[] = [
  { value: 0, label: "osu!" },
  { value: 1, label: "Taiko" },
  { value: 2, label: "Catch" },
  { value: 3, label: "Mania" },
];

export function LeaderboardTable() {
  const [mode, setMode] = useState<GameMode>(0);
  const [relax, setRelax] = useState(false);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard(mode, relax)
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "failed to load leaderboard");
      });
    return () => {
      cancelled = true;
    };
  }, [mode, relax]);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex gap-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`rounded px-3 py-1 text-sm ${
                mode === m.value ? "bg-osupink text-neutral-950" : "bg-neutral-800"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input type="checkbox" checked={relax} onChange={(e) => setRelax(e.target.checked)} />
          Relax
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-800 text-neutral-400">
            <th className="py-2">#</th>
            <th></th>
            <th>Player</th>
            <th className="text-right">PP</th>
            <th className="text-right">Accuracy</th>
            <th className="text-right">Plays</th>
            <th className="text-right">Country</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.user_id} className="border-b border-neutral-900">
              <td className="py-2 font-semibold text-osupink">{entry.rank}</td>
              <td>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={entry.avatar_url} alt={entry.username} className="h-8 w-8 rounded" />
              </td>
              <td>{entry.username}</td>
              <td className="text-right">{entry.pp.toFixed(2)}</td>
              <td className="text-right">{entry.accuracy.toFixed(2)}%</td>
              <td className="text-right">{entry.play_count}</td>
              <td className="text-right">{entry.country}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
