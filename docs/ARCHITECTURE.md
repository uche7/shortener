# Architecture

## Overview

npm-workspaces monorepo with two applications:

```
apps/api   Express 5 + TypeScript — owns all data and the short URL origin
apps/web   Next.js 16 (App Router) — UI consuming the API over HTTP
```

The API is a standalone product (the assignment requires programmatic
integration), the web app is one of its clients. They share nothing at build
time; the contract is the documented JSON envelope.

## Backend

### Request lifecycle

```
CORS → JSON body parsing → request logging
  → /api routes → validation middleware (Zod) → controller → service → repository
  → /:shortPath redirect route
  → 404 handler (terminal)
  → error handler (terminal)
```

### Layers and responsibilities

| Layer            | Responsibility                                                      | Never does                 |
| ---------------- | ------------------------------------------------------------------- | -------------------------- |
| routes           | map paths to middleware + controller                                | logic                      |
| validators (Zod) | shape, normalize and reject input                                   | business rules             |
| controllers      | coordinate: read validated input, call service, send envelope       | validation, business logic |
| services         | business rules: idempotent encode, collision retry, visit semantics | HTTP concerns              |
| repositories     | persistence behind the `UrlRepository` interface                    | business rules             |

Supporting pieces: a single `AppError` hierarchy mapped to the envelope by one
global error handler; `sendSuccess`/`sendError` as the only envelope
constructors; config parsed and frozen once at startup; constants named in one
place (slug length, retry budget, URL/search limits, Base62 pattern).

### Dependency injection

`container.ts` is the composition root — the only file that chooses concrete
implementations (`InMemoryUrlRepository → UrlService → UrlController`).
`createApp(container)` receives the graph, and defaults to a fresh container
per call, which is why integration tests are isolated without reset hooks.

### Key decisions

- **`UrlRepository` is async although the store is a `Map`** — swapping in
  Redis/PostgreSQL is a new implementation file plus one line in the
  container; no consumer changes.
- **Random Base62 slugs (6 chars, `crypto.randomInt`) with bounded collision
  retry** rather than an encoded counter — counters leak creation volume and
  make slugs guessable. 62⁶ ≈ 5.7 × 10¹⁰ keeps collisions rare; the retry loop
  makes them harmless; slug generation is injectable so tests force collisions
  deterministically.
- **Encode is idempotent, including under concurrency** — a per-URL in-flight
  promise map prevents the lookup/save interleaving race that would create
  duplicate slugs for the same URL (covered by unit and HTTP-level tests).
- **Redirects use 302, not 301** — browsers cache 301s permanently, which
  would bypass the server on repeat visits and silently break visit counting.
- **`UrlRecord` is immutable** — the repository copies on the way in and out
  and produces new records for visit updates; nothing outside it can corrupt
  the store.
- **App factory separated from the HTTP listener** — Supertest exercises the
  entire middleware pipeline without binding a port.
- **Express 5 accommodations** — `req.query` is a read-only getter, so
  validated query params ride on `res.locals`; inline route-param regexes are
  gone, so slug shape is guarded in the controller.

## Frontend

### Structure

```
src/
  app/          routes (server components; metadata)
  components/   shared UI: shadcn/ui primitives, layout, theme
  features/urls feature module: api calls, hooks, components, validation
  hooks/        generic hooks (debounce, clipboard)
  lib/          api client, query keys, formatting, cn
  providers/    TanStack Query + theme providers
  types/        mirrored API contracts
```

Feature-first: everything about URLs lives in `features/urls`. Components are
presentational; containers hold the (minimal) state; **no fetch call exists
outside `lib/api-client.ts` + the feature's `api.ts`**.

### State management

Server state only, via TanStack Query. Query keys come from one factory
(`urlKeys`), so the encode mutation invalidates `urlKeys.all` and every list
view refetches automatically. The list uses `keepPreviousData` for
flicker-free search; stats queries are `enabled`-gated so they fetch only when
a dialog opens. Visit counts stay live without manual refresh: the list and
stats queries refetch on window focus (the moment you return from clicking a
short link) and on a 15-second interval. No optimistic update for encode —
the server invents the slug, so there is nothing truthful to render early.

### Validation

The form schema mirrors the API's rules (trim, ≤ 2048 chars, http(s)-only)
with friendlier copy, so most errors never cost a round-trip; the server
remains authoritative and its 400s surface through the same error path.

### Tradeoff: mirrored types instead of a shared package

API response types are duplicated in `apps/web/src/types/api.ts` (annotated
as a mirror; the API is the source of truth). A `packages/shared` workspace
would eliminate the duplication but forces cross-package TS build
orchestration (project references or a build step) on both apps — not worth it
for ~40 lines. Revisit if the shared surface grows.

## Testing strategy

- **Unit tests** target pure logic in isolation: slug generation (injectable
  RNG), repository semantics, service rules (idempotency, collisions,
  concurrency), stat derivation (injectable clock), error handler
  sanitization.
- **Integration tests** (Supertest) exercise real HTTP through the full
  middleware stack: round-trips across endpoints (encode → redirect → stats),
  validation failures, 404 envelopes, malformed JSON, length boundaries,
  unicode URLs, concurrent encoding.
- **Coverage thresholds** (90/85/90/90) are enforced in `vitest.config.ts` —
  the suite fails on regression.
- **Web tests** (Vitest + Testing Library, jsdom) cover the validation schema,
  formatting utilities, the debounce hook, and the creation form's
  validation/submit/error flow with the API layer mocked at the feature
  boundary.

## Future improvements

- Redis or PostgreSQL repository implementation (the seam already exists)
- Pagination on `/api/list` once datasets grow
- Rate limiting and abuse protection on encode/redirect
- Custom slugs and link expiry
- Auth + per-user link ownership
- E2E tests (Playwright) for the web flows
- CI pipeline running lint, typecheck, tests and coverage on every push
