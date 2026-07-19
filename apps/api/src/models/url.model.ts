/**
 * Immutable snapshot of a shortened URL. Visit statistics are updated by the
 * repository, which produces a new record rather than mutating in place.
 */
export interface UrlRecord {
  readonly shortPath: string;
  readonly longUrl: string;
  readonly createdAt: Date;
  readonly visitCount: number;
  readonly firstVisitedAt: Date | null;
  readonly lastVisitedAt: Date | null;
}

export function createUrlRecord(shortPath: string, longUrl: string): UrlRecord {
  return {
    shortPath,
    longUrl,
    createdAt: new Date(),
    visitCount: 0,
    firstVisitedAt: null,
    lastVisitedAt: null,
  };
}
