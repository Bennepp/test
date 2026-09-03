import { fetchProfile } from "@/lib/api";
import { countryFlag } from "@/lib/countryFlag";

const MODE_NAMES = ["osu!", "Taiko", "Catch", "Mania"];

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const profile = await fetchProfile(Number(params.id));
  const primary = profile.stats.find((s) => s.mode === 0 && !s.relax);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-4 border-b border-neutral-800 pb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/avatar/${profile.user_id}`}
          alt={profile.username}
          className="h-16 w-16 rounded-full bg-neutral-800 object-cover"
        />
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            {profile.username} <span>{countryFlag(profile.country)}</span>
          </h1>
          <p className="text-sm text-neutral-400">
            Joined {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {primary && (
        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="PP" value={primary.pp.toFixed(0)} />
          <Stat label="Accuracy" value={`${primary.accuracy.toFixed(2)}%`} />
          <Stat label="Play count" value={primary.play_count.toLocaleString()} />
          <Stat label="Rank" value={primary.global_rank ? `#${primary.global_rank}` : "unranked"} />
        </dl>
      )}

      <h2 className="mt-8 text-lg font-semibold text-osupink">Stats by mode</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {profile.stats.map((s) => (
          <li key={`${s.mode}-${s.relax}`} className="flex justify-between border-b border-neutral-900 py-2">
            <span>
              {MODE_NAMES[s.mode]} {s.relax ? "(Relax)" : ""}
            </span>
            <span className="tabular-nums">{s.pp.toFixed(0)}pp</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-900 p-3">
      <dt className="text-xs uppercase text-neutral-500">{label}</dt>
      <dd className="text-lg font-semibold">{value}</dd>
    </div>
  );
}
