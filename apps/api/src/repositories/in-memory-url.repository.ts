import type { UrlRepository } from "../interfaces/url-repository.interface";
import type { UrlRecord } from "../models/url.model";

/**
 * Map-backed store, as the assignment requires all data to stay in memory.
 * A secondary index makes long-URL lookups O(1) so encoding stays idempotent
 * without scanning. Records are copied on the way in and out; the store is
 * the only owner of its state.
 */
export class InMemoryUrlRepository implements UrlRepository {
  private readonly recordsByShortPath = new Map<string, UrlRecord>();
  private readonly shortPathsByLongUrl = new Map<string, string>();

  async save(record: UrlRecord): Promise<UrlRecord> {
    this.recordsByShortPath.set(record.shortPath, { ...record });
    this.shortPathsByLongUrl.set(record.longUrl, record.shortPath);
    return { ...record };
  }

  async findByShortPath(shortPath: string): Promise<UrlRecord | null> {
    const record = this.recordsByShortPath.get(shortPath);
    return record ? { ...record } : null;
  }

  async findByLongUrl(longUrl: string): Promise<UrlRecord | null> {
    const shortPath = this.shortPathsByLongUrl.get(longUrl);
    return shortPath ? this.findByShortPath(shortPath) : null;
  }

  async findAll(): Promise<UrlRecord[]> {
    return Array.from(this.recordsByShortPath.values(), (record) => ({
      ...record,
    }));
  }

  async recordVisit(
    shortPath: string,
    visitedAt: Date
  ): Promise<UrlRecord | null> {
    const existing = this.recordsByShortPath.get(shortPath);
    if (!existing) return null;

    const updated: UrlRecord = {
      ...existing,
      visitCount: existing.visitCount + 1,
      firstVisitedAt: existing.firstVisitedAt ?? visitedAt,
      lastVisitedAt: visitedAt,
    };
    this.recordsByShortPath.set(shortPath, updated);
    return { ...updated };
  }
}
