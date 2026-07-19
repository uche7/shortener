import type { UrlRecord } from "../models/url.model";
import type { UrlDto, UrlStatsDto } from "../types/url.dto";

const MS_PER_DAY = 86_400_000;

export function toUrlDto(record: UrlRecord, baseUrl: string): UrlDto {
  return {
    shortPath: record.shortPath,
    shortUrl: `${baseUrl}/${record.shortPath}`,
    longUrl: record.longUrl,
    createdAt: record.createdAt.toISOString(),
    visitCount: record.visitCount,
    firstVisitedAt: record.firstVisitedAt?.toISOString() ?? null,
    lastVisitedAt: record.lastVisitedAt?.toISOString() ?? null,
  };
}

/** `now` is injectable so derived, time-based stats are testable. */
export function toUrlStatsDto(
  record: UrlRecord,
  baseUrl: string,
  now: Date = new Date()
): UrlStatsDto {
  const ageInDays = wholeDaysBetween(record.createdAt, now);

  return {
    ...toUrlDto(record, baseUrl),
    longUrlDomain: new URL(record.longUrl).hostname,
    ageInDays,
    averageVisitsPerDay: roundTo2(record.visitCount / Math.max(ageInDays, 1)),
    hasBeenVisited: record.visitCount > 0,
    daysSinceLastVisit: record.lastVisitedAt
      ? wholeDaysBetween(record.lastVisitedAt, now)
      : null,
  };
}

function wholeDaysBetween(from: Date, to: Date): number {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY));
}

function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}
