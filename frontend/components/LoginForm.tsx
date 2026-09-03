"use client";

import Link from "next/link";
import { useState } from "react";
import { login } from "@/lib/api";
import { setToken } from "@/lib/auth";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { access_token } = await login(username, password);
      setToken(access_token);
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8">
      <h1 className="text-2xl font-bold text-osupink">Log in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="rounded-lg border border-neutral-800 bg-neutral-800 px-3 py-2 outline-none focus:border-osupink focus:ring-1 focus:ring-osupink"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <input
          className="rounded-lg border border-neutral-800 bg-neutral-800 px-3 py-2 outline-none focus:border-osupink focus:ring-1 focus:ring-osupink"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-osupink px-3 py-2 font-semibold text-neutral-950 hover:brightness-110 disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="text-center text-sm text-neutral-400">
        Need an account?{" "}
        <Link href="/register" className="text-osupink hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
