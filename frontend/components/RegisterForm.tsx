"use client";

import Link from "next/link";
import { useState } from "react";
import { register } from "@/lib/api";
import { setToken } from "@/lib/auth";

export function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const { access_token } = await register(username, email, password);
      setToken(access_token);
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-12 md:grid-cols-2 md:items-center">
      <div>
        <h1 className="text-5xl font-extrabold leading-tight">
          kyoku<span className="text-osupink">!</span>
          <br />
          <span className="text-neutral-500">one account.</span>
          <br />
          web and in-
          <br />
          game.
        </h1>
        <p className="mt-4 max-w-sm text-neutral-400">
          Your username and password work on this site and in the osu! client. Register here, then
          launch the game with the{" "}
          <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-sm text-osupink">-devserver</code>{" "}
          flag to start submitting scores.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8">
        <h2 className="text-xl font-bold">Create your account</h2>
        <p className="mt-1 text-sm text-neutral-400">Free, takes thirty seconds, works in-game immediately.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">Username</label>
            <input
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 outline-none focus:border-osupink focus:ring-1 focus:ring-osupink"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <p className="mt-1 text-xs text-neutral-500">2-15 characters. This is your in-game name.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 outline-none focus:border-osupink focus:ring-1 focus:ring-osupink"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 outline-none focus:border-osupink focus:ring-1 focus:ring-osupink"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              maxLength={32}
              required
            />
            <p className="mt-1 text-xs text-neutral-500">8-32 characters.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Confirm password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 outline-none focus:border-osupink focus:ring-1 focus:ring-osupink"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-osupink px-3 py-2.5 font-semibold text-neutral-950 hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-neutral-400">
            Already have an account?{" "}
            <Link href="/login" className="text-osupink hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
