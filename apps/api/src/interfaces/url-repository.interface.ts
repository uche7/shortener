import type { UrlRecord } from "../models/url.model";

/**
 * Persistence abstraction for shortened URLs. Deliberately async so a
 * network-backed implementation (Redis, PostgreSQL) can replace the
 * in-memory one without touching any consumer.
 */
export interface UrlRepository {
  save(record: UrlRecord): Promise<UrlRecord>;
  findByShortPath(shortPath: string): Promise<UrlRecord | null>;
  findByLongUrl(longUrl: string): Promise<UrlRecord | null>;
  /** Returns all records in insertion order. */
  findAll(): Promise<UrlRecord[]>;
  /**
   * Increments the visit counter and updates first/last visit timestamps.
   * Returns the updated record, or null when the short path is unknown.
   */
  recordVisit(shortPath: string, visitedAt: Date): Promise<UrlRecord | null>;
}
