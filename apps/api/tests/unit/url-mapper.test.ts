import { describe, expect, it } from "vitest";
import { toUrlStatsDto } from "../../src/helpers/url-mapper";
import type { UrlRecord } from "../../src/models/url.model";

const BASE_URL = "http://short.est";

function record(overrides: Partial<UrlRecord>): UrlRecord {
  return {
    shortPath: "GeAi9K",
    longUrl: "https://indicina.co/careers",
    createdAt: new Date("2026-07-01T00:00:00Z"),
    visitCount: 0,
    firstVisitedAt: null,
    lastVisitedAt: null,
    ...overrides,
  };
}

describe("toUrlStatsDto", () => {
  const now = new Date("2026-07-11T00:00:00Z");

  it("derives stats for a never-visited record", () => {
    const stats = toUrlStatsDto(record({}), BASE_URL, now);

    expect(stats.shortUrl).toBe("http://short.est/GeAi9K");
    expect(stats.longUrlDomain).toBe("indicina.co");
    expect(stats.ageInDays).toBe(10);
    expect(stats.averageVisitsPerDay).toBe(0);
    expect(stats.hasBeenVisited).toBe(false);
    expect(stats.daysSinceLastVisit).toBeNull();
  });

  it("derives stats for a visited record", () => {
    const stats = toUrlStatsDto(
      record({
        visitCount: 25,
        firstVisitedAt: new Date("2026-07-02T00:00:00Z"),
        lastVisitedAt: new Date("2026-07-08T12:00:00Z"),
      }),
      BASE_URL,
      now
    );

    expect(stats.ageInDays).toBe(10);
    expect(stats.averageVisitsPerDay).toBe(2.5);
    expect(stats.hasBeenVisited).toBe(true);
    expect(stats.daysSinceLastVisit).toBe(2);
  });

  it("avoids division by zero for brand-new records", () => {
    const created = new Date("2026-07-11T00:00:00Z");
    const stats = toUrlStatsDto(
      record({ createdAt: created, visitCount: 4 }),
      BASE_URL,
      created
    );

    expect(stats.ageInDays).toBe(0);
    expect(stats.averageVisitsPerDay).toBe(4);
  });
});
