"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { searchUsers, type UserSearchResult } from "@/lib/api";
import { countryFlag } from "@/lib/countryFlag";

export function UserSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [open, setOpen] = useState(false);

  async function handleChange(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    try {
      const found = await searchUsers(value);
      setResults(found);
      setOpen(true);
    } catch {
      setResults([]);
    }
  }

  function goToProfile(userId: number) {
    setOpen(false);
    setQuery("");
    router.push(`/profile/${userId}`);
  }

  return (
    <div className="relative w-48 sm:w-64">
      <input
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search players"
        className="w-full rounded-full border border-neutral-800 bg-neutral-900 px-4 py-1.5 text-sm outline-none focus:border-osupink"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 shadow-lg">
          {results.map((r) => (
            <li key={r.user_id}>
              <button
                onMouseDown={() => goToProfile(r.user_id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-800"
              >
                <span>{countryFlag(r.country)}</span>
                <span>{r.username}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
