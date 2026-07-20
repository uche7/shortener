# API Reference

Base URL (local): `http://localhost:4000`

## Response envelope

Every endpoint responds with JSON in a consistent envelope.

Success:

```json
{ "success": true, "message": "…", "data": {} }
```

Failure:

```json
{ "success": false, "message": "…", "error": {} }
```

Validation failures (`400`) include per-field issues:

```json
{
  "success": false,
  "message": "Invalid request body",
  "error": {
    "issues": [{ "path": "url", "message": "url must be a valid http(s) URL" }]
  }
}
```

## POST /api/encode

Shortens a URL. Encoding is **idempotent**: submitting an already-shortened URL
returns the existing mapping.

Request:

```json
{ "url": "https://indicina.co" }
```

`201 Created` (first time) / `200 OK` (already existed):

```json
{
  "success": true,
  "message": "Short URL created",
  "data": {
    "shortPath": "GeAi9K",
    "shortUrl": "http://localhost:4000/GeAi9K",
    "longUrl": "https://indicina.co",
    "createdAt": "2026-07-20T09:30:00.000Z",
    "visitCount": 0,
    "firstVisitedAt": null,
    "lastVisitedAt": null
  }
}
```

Errors: `400` for a missing or empty `url`, one longer than 2048 characters,
or one that is not a valid `http(s)` URL.

## POST /api/decode

Resolves a short URL back to the original. Accepts a full short URL or a bare
path.

Request (either form):

```json
{ "shortUrl": "http://localhost:4000/GeAi9K" }
```

```json
{ "shortUrl": "GeAi9K" }
```

`200 OK` with the same `data` shape as encode.

Errors: `400` if the input contains no plausible short path; `404` for an
unknown short path.

## GET /api/statistic/{url_path}

Visit statistics for a short path, e.g. `/api/statistic/GeAi9K`.

`200 OK`:

```json
{
  "success": true,
  "message": "Short URL statistics",
  "data": {
    "shortPath": "GeAi9K",
    "shortUrl": "http://localhost:4000/GeAi9K",
    "longUrl": "https://indicina.co",
    "longUrlDomain": "indicina.co",
    "createdAt": "2026-07-10T09:30:00.000Z",
    "visitCount": 25,
    "firstVisitedAt": "2026-07-11T08:00:00.000Z",
    "lastVisitedAt": "2026-07-18T21:12:00.000Z",
    "ageInDays": 10,
    "averageVisitsPerDay": 2.5,
    "hasBeenVisited": true,
    "daysSinceLastVisit": 2
  }
}
```

Derived fields: `ageInDays` (whole days since creation),
`averageVisitsPerDay` (visits ÷ age, minimum age of 1 day),
`daysSinceLastVisit` (`null` when never visited).

Errors: `404` for an unknown or malformed short path.

## GET /api/list

Lists every shortened URL, newest first.

Query parameters:

| Param    | Rules                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| `search` | optional; case-insensitive substring match on the **long URL**; minimum 3 characters; empty value means "no filter" |

`200 OK`:

```json
{
  "success": true,
  "message": "All short URLs",
  "data": { "urls": [{ "shortPath": "GeAi9K", "…": "…" }], "total": 1 }
}
```

Errors: `400` if `search` is shorter than 3 characters.

## GET /{url_path}

Redirects to the original URL and records the visit (count + first/last visit
timestamps). Uses `302 Found` so repeat visits reach the server and are counted
(a `301` would be cached permanently by browsers).

Responses: `302` with `Location` header; `404` JSON envelope for unknown or
non-Base62 paths.

## GET /api/health

`200 OK` with uptime, environment and timestamp, useful as a liveness probe.
