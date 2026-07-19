import type { UrlRecord } from "../models/url.model";
import type { UrlDto } from "../types/url.dto";

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
