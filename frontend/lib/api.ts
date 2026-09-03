// The website calls its own API through the same origin the page was
// loaded from when running in the browser (Caddy proxies /api/* on
// http://{$DOMAIN} to the backend - see proxy/Caddyfile). That's
// same-origin by default, so no env var, CORS setup, or extra DNS entry is
// needed for the website; only the osu! game client needs the c./osu./a.
// subdomains, since those are hardcoded by the Bancho protocol itself.
//
// Server Components run inside the `web` container's Node.js process, not
// the browser, so a relative fetch() there can't resolve against "the
// current page" the way browser fetch does - it needs an absolute URL. On
// the server we talk directly to the `api` container over the Docker
// network instead, bypassing Caddy entirely.
const BROWSER_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const SERVER_API_BASE_URL = process.env.INTERNAL_API_BASE_URL ?? "http://api:8000";

function apiBaseUrl(): string {
  return typeof window === "undefined" ? SERVER_API_BASE_URL : BROWSER_API_BASE_URL;
}

export type GameMode = 0 | 1 | 2 | 3; // osu! | taiko | catch | mania
export type LeaderboardSort = "performance" | "score";

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  country: string;
  pp: number;
  accuracy: number;
  play_count: number;
  total_score: number;
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

export interface UserSearchResult {
  user_id: number;
  username: string;
  country: string;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBaseUrl()}${path}`, {
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

export function fetchLeaderboard(
  mode: GameMode,
  relax: boolean,
  sort: LeaderboardSort = "performance",
): Promise<LeaderboardEntry[]> {
  return apiFetch(`/api/leaderboard?mode=${mode}&relax=${relax}&sort=${sort}`);
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

export function searchUsers(query: string): Promise<UserSearchResult[]> {
  return apiFetch(`/api/users/search?q=${encodeURIComponent(query)}`);
}
