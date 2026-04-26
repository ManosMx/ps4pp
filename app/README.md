# ps4pp — Next.js App

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose plugin
- [Bun](https://bun.sh/) (`curl -fsSL https://bun.sh/install | bash`)

---

## Dev setup

### 1 — Start the Supabase stack

```bash
cd supabase-project
docker compose up -d
```

Wait a few seconds for Postgres to be healthy:
```bash
docker ps --format 'table {{.Names}}\t{{.Status}}'
# supabase-db should show (healthy)
```

The stack exposes the API at `http://localhost:8000`.

### 2 — Install app dependencies

```bash
cd app
bun install
```

### 3 — Configure environment

`app/.env.local` is already checked in with the correct dev defaults:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=<demo anon key>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA   # always-pass test key
```

No edits needed for local dev.

### 4 — Start the dev server

```bash
cd app
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Useful commands

| Task | Command (run from `app/`) |
|---|---|
| Dev server | `bun dev` |
| Production build | `bun run build` |
| Lint | `bun lint` |
| Generate Supabase types | `bun run gen-types` (requires local stack running) |

### Supabase stack

| Task | Command (run from `supabase-project/`) |
|---|---|
| Start | `docker compose up -d` |
| Stop | `docker compose down` |
| Reset (wipe DB) | `bash reset.sh` |
| Open Studio | `docker compose --profile studio up -d studio` then visit `http://localhost:8000` |

---

## Architecture

```
browser → Next.js dev server (localhost:3000/app)
               ↓
          Supabase stack (localhost:8000)
               ├── Caddy (reverse proxy)
               ├── GoTrue (auth)
               ├── PostgREST (REST API)
               ├── Storage
               └── PostgreSQL
```

Server-side code uses `SUPABASE_URL` (set to `http://caddy:8000` in Docker, `http://localhost:8000` in dev). Client-side code uses `NEXT_PUBLIC_SUPABASE_URL`.

---

## Production deployment

See [audit.md](../audit.md) for the full step-by-step deployment guide.
