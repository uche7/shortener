/**
 * Mirrors the response contracts of @shortener/api, which is the source of
 * truth. Kept as a single local file instead of a shared package to avoid
 * cross-package TS build orchestration for a handful of types.
 */
export interface ApiSuccessEnvelope<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorEnvelope {
  success: false;
  message: string;
  error?: unknown;
}

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export interface UrlDto {
  shortPath: string;
  shortUrl: string;
  longUrl: string;
  createdAt: string;
  visitCount: number;
  firstVisitedAt: string | null;
  lastVisitedAt: string | null;
}

export interface UrlListDto {
  urls: UrlDto[];
  total: number;
}

export interface UrlStatsDto extends UrlDto {
  longUrlDomain: string;
  ageInDays: number;
  averageVisitsPerDay: number;
  hasBeenVisited: boolean;
  daysSinceLastVisit: number | null;
}
