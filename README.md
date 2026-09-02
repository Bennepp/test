# Private osu! server (Bancho-compatible)

A self-hostable osu! private server: an async FastAPI backend implementing
the Bancho login handshake, score submission, and a JSON API, plus a
Next.js/Tailwind leaderboard + profile frontend. Runs locally under Docker
Compose and is designed to move to a VPS by changing one file (`.env`).

## Stack

| Service | Tech                                   | Purpose                                     |
| ------- | --------------------------------------- | -------------------------------------------- |
| `api`   | FastAPI (Python, async)                 | Bancho handshake, score submission, JSON API |
| `web`   | Next.js 14 (App Router) + Tailwind      | Leaderboard, login, profile pages            |
| `mysql` | MariaDB 11                              | Users, stats, beatmaps, scores               |
| `redis` | Redis 7                                 | Session cache, real-time leaderboards        |
| `proxy` | Caddy 2                                 | Routes `-devserver` subdomains, TLS          |

## 1. Quickstart (local Docker)

```sh
cp .env.example .env
# edit .env: at minimum change the *_PASSWORD and JWT_SECRET values

docker compose up -d --build
```

This starts everything under `localhost`:

- `http://localhost` - the web frontend
- `http://c.localhost` - Bancho (game client) endpoint
- `http://osu.localhost` - score submission / beatmap web endpoints
- `http://a.localhost` - avatars

`c.localhost` / `osu.localhost` / `a.localhost` resolve automatically on
most systems because `*.localhost` maps to `127.0.0.1`; on Windows you may
need to add them to `C:\Windows\System32\drivers\etc\hosts`.

## 2. Create the first user

The game client can't register accounts, so create one through the web API:

```sh
curl -X POST http://osu.localhost/api/register \
  -H "Content-Type: application/json" \
  -d '{"username": "peppy", "email": "peppy@example.com", "password": "hunter22"}'
```

This returns a bearer token and creates zero-stat rows for all four modes.
Log in at `http://localhost/login` with the same credentials.

## 3. Launch the osu! client against the dev server

```sh
osu.exe -devserver localhost
```

(or whatever domain you set in `.env`). The client will hit `c.localhost`
for the Bancho handshake using the username/password you just registered.

## 4. Moving to a VPS

1. Point `DOMAIN` (and a wildcard DNS record `*.yourdomain.com`) at the VPS.
2. Update `.env`: `DOMAIN=yourdomain.com`,
   `NEXT_PUBLIC_API_BASE_URL=https://osu.yourdomain.com`, and rotate all
   passwords/`JWT_SECRET`.
3. `docker compose up -d --build` on the VPS. Caddy automatically obtains
   Let's Encrypt certificates for the four hostnames once DNS resolves.

No application code changes are required for this migration - everything
domain/secret-related is read from `.env`.

## Repository layout

- `backend/` - FastAPI app: Bancho handshake (`app/routers/bancho.py`),
  score submission stub (`app/routers/score_submission.py`), web JSON API
  (`app/routers/web_api.py`), avatar storage (`app/routers/avatars.py`),
  binary packet serialization (`app/bancho/packets.py`), PP calculation via
  `rosu-pp-py` (`app/pp.py`).
- `frontend/` - Next.js App Router site: login (`app/login`), PP leaderboard
  (`app/page.tsx`), profile (`app/profile/[id]`).
- `db/init/001_schema.sql` - `users` / `stats` / `beatmaps` / `scores` schema,
  auto-applied on first MariaDB start.
- `proxy/Caddyfile` - subdomain routing for `-devserver`.
- `docker-compose.yml` - wires all five containers together.

## Known stubs / next steps

- Score submission (`app/routers/score_submission.py`) documents the exact
  decryption + persistence steps but does not yet decrypt the client's
  Rijndael-256-CBC score payload or write `Score`/`Stats` rows.
- Bancho sessions are held in-process (`app/bancho/sessions.py`); a
  multi-worker deployment needs to move this into Redis.
- Beatmap download/mirroring (`/web/osu-search.php`, `.osz` downloads) is
  not implemented; `calculate_pp` expects `.osu` files to already exist
  under `/data/beatmaps`.
