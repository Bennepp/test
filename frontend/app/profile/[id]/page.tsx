import { fetchProfile } from "@/lib/api";

const MODE_NAMES = ["osu!", "Taiko", "Catch", "Mania"];

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const profile = await fetchProfile(Number(params.id));
  const primary = profile.stats.find((s) => s.mode === 0 && !s.relax);

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="flex items-center gap-4 border-b border-neutral-800 pb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/avatar/${profile.user_id}`}
          alt={profile.username}
          className="h-16 w-16 rounded-full"
        />
        <div>
          <h1 className="text-xl font-bold">{profile.username}</h1>
          <p className="text-sm text-neutral-400">{profile.country}</p>
        </div>
      </div>

      {primary && (
        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="PP" value={primary.pp.toFixed(2)} />
          <Stat label="Accuracy" value={`${primary.accuracy.toFixed(2)}%`} />
          <Stat label="Play count" value={primary.play_count.toString()} />
          <Stat label="Rank" value={`#${primary.global_rank || "-"}`} />
        </dl>
      )}

      <h2 className="mt-8 text-lg font-semibold text-osupink">Stats by mode</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {profile.stats.map((s) => (
          <li key={`${s.mode}-${s.relax}`} className="flex justify-between border-b border-neutral-900 py-1">
            <span>
              {MODE_NAMES[s.mode]} {s.relax ? "(Relax)" : ""}
            </span>
            <span>{s.pp.toFixed(2)}pp</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-neutral-900 p-3">
      <dt className="text-xs uppercase text-neutral-500">{label}</dt>
      <dd className="text-lg font-semibold">{value}</dd>
    </div>
  );
}
