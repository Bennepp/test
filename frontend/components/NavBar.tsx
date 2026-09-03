"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearToken, getToken } from "@/lib/auth";
import { UserSearch } from "@/components/UserSearch";

export function NavBar() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(getToken()));
  }, []);

  function handleLogout() {
    clearToken();
    window.location.href = "/";
  }

  return (
    <nav className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-osupink text-sm text-neutral-950">
            !
          </span>
          kyoku<span className="text-osupink">!</span>
        </Link>
        <Link href="/" className="text-sm text-neutral-300 hover:text-white">
          Leaderboard
        </Link>
        <Link href="/connect" className="text-sm text-neutral-300 hover:text-white">
          How to connect
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <UserSearch />
          {loggedIn ? (
            <button onClick={handleLogout} className="text-sm text-neutral-300 hover:text-white">
              Log out
            </button>
          ) : (
            <>
              <Link href="/login" className="text-sm text-neutral-300 hover:text-white">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-osupink px-4 py-1.5 text-sm font-semibold text-neutral-950 hover:brightness-110"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
