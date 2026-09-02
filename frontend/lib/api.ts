// Single source of truth for the backend base URL, sourced from env so the
// frontend never hardcodes localhost/a domain.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type GameMode = 0 | 1 | 2 | 3; // osu! | taiko | catch | mania

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  country: string;
  pp: number;
  accuracy: number;
  play_count: number;
  avatar_url: string;
}

export interface ModeStats {
  mode: GameMode;
  relax: boolean;
  pp: number;
  accuracy: number;
  play_count: number;
  ranked_score: number;
  total_score: number;
  global_rank: number;
}

export interface ProfileResponse {
  user_id: number;
  username: string;
  country: string;
  created_at: string;
  stats: ModeStats[];
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`API ${path} failed (${res.status}): ${detail}`);
  }
  return res.json() as Promise<T>;
}

export function fetchLeaderboard(mode: GameMode, relax: boolean): Promise<LeaderboardEntry[]> {
  return apiFetch(`/api/leaderboard?mode=${mode}&relax=${relax}`);
}

export function login(username: string, password: string): Promise<{ access_token: string }> {
  return apiFetch("/api/login", { method: "POST", body: JSON.stringify({ username, password }) });
}

export function register(
  username: string,
  email: string,
  password: string,
): Promise<{ access_token: string }> {
  return apiFetch("/api/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export function fetchProfile(userId: number): Promise<ProfileResponse> {
  return apiFetch(`/api/profile/${userId}`);
}
