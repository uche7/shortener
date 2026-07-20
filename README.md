# ShortLink — URL Shortener

A URL shortening service: paste a long URL, get a short one, share it anywhere,
and track every visit. Built as a take-home assessment with a focus on clean
architecture, SOLID principles and test coverage.

**Web UI** — create short links, browse and search your history, and open
per-link analytics.
**JSON API** — every capability is also exposed for programmatic integration.

All data is kept **in memory** by design (an assignment requirement) — restarting
the API clears all links.

## Stack

|         |                                                                                                                 |
| ------- | --------------------------------------------------------------------------------------------------------------- |
| API     | Node.js, Express 5, TypeScript (strict)                                                                         |
| Web     | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query, React Hook Form, Zod |
| Tests   | Vitest, Supertest                                                                                               |
| Tooling | npm workspaces, ESLint, Prettier, Husky + lint-staged                                                           |

## Repository layout

```
apps/
  api/   Express API — encode, decode, statistics, list, redirect
  web/   Next.js frontend
docs/
  API.md            endpoint reference with examples
  ARCHITECTURE.md   design decisions and tradeoffs
```

## Prerequisites

- **Node.js ≥ 20.9** (Next 16 / Express 5 requirement)
- npm 10+ (ships with Node 20)

## Getting started

```bash
npm install        # from the repo root — installs every workspace
npm run dev        # starts API (http://localhost:4000) and web (http://localhost:3000)
```

Then open **http://localhost:3000**, paste a URL and shorten it. The short URL
is served by the API origin, e.g. `http://localhost:4000/GeAi9K`.

Run one app at a time with `npm run dev:api` or `npm run dev:web`.

### Environment variables

Both apps run with sensible defaults and need no configuration locally.

| Variable              | App | Default                   | Purpose                                                    |
| --------------------- | --- | ------------------------- | ---------------------------------------------------------- |
| `PORT`                | api | `4000`                    | API listen port                                            |
| `API_BASE_URL`        | api | `http://localhost:<PORT>` | Origin used when composing short URLs                      |
| `NEXT_PUBLIC_API_URL` | web | `http://localhost:4000`   | API origin the browser calls (see `apps/web/.env.example`) |

## Running the tests

```bash
npm test                                   # all workspaces (64 tests)
npm run test:coverage -w @shortener/api    # with coverage report + enforced thresholds
npm run test:watch -w @shortener/api       # watch mode
```

The API suite contains **unit tests** (services, repository, slug generation,
mappers, middleware) and **integration tests** that exercise the full Express
pipeline through Supertest — including encode/decode round-trips, redirect visit
counting, validation failures and concurrency edge cases. Coverage thresholds
(90% statements / 85% branches / 90% functions / 90% lines) are enforced; the
suite fails if coverage regresses.

## Other commands

```bash
npm run lint       # ESLint across all workspaces
npm run build      # production build of every workspace
npm run format     # Prettier over the repo
```

Production start after a build:

```bash
npm run start -w @shortener/api    # serves API + redirects
npm run start -w @shortener/web    # serves the frontend
```

## API at a glance

| Method | Path                        | Purpose                                         |
| ------ | --------------------------- | ----------------------------------------------- |
| POST   | `/api/encode`               | Shorten a URL                                   |
| POST   | `/api/decode`               | Resolve a short URL back to the original        |
| GET    | `/api/statistic/{url_path}` | Visit statistics for a short path               |
| GET    | `/api/list?search=`         | List all URLs, optional search (min 3 chars)    |
| GET    | `/{url_path}`               | Redirect to the original URL (counts the visit) |
| GET    | `/api/health`               | Health check                                    |

All endpoints return a consistent JSON envelope. Full request/response examples
in [docs/API.md](docs/API.md); design rationale in
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
