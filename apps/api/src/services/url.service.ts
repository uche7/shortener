import {
  MAX_SLUG_GENERATION_ATTEMPTS,
  SHORT_PATH_LENGTH,
} from "../constants/url";
import { SlugGenerationError } from "../errors/slug-generation-error";
import { UrlNotFoundError } from "../errors/url-not-found-error";
import type { UrlRepository } from "../interfaces/url-repository.interface";
import { createUrlRecord, type UrlRecord } from "../models/url.model";
import { generateBase62Slug } from "../utils/base62";

export type SlugGenerator = () => string;

export interface EncodeResult {
  record: UrlRecord;
  wasCreated: boolean;
}

const defaultSlugGenerator: SlugGenerator = () =>
  generateBase62Slug(SHORT_PATH_LENGTH);

export class UrlService {
  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly generateSlug: SlugGenerator = defaultSlugGenerator
  ) {}

  private readonly inFlightEncodes = new Map<string, Promise<EncodeResult>>();

  /**
   * Idempotent: encoding an already-shortened URL returns its existing record.
   * Concurrent encodes of the same URL share one in-flight promise, so
   * idempotency holds even when requests interleave between await points.
   */
  async encode(longUrl: string): Promise<EncodeResult> {
    const inFlight = this.inFlightEncodes.get(longUrl);
    if (inFlight) return inFlight;

    const encoding = this.doEncode(longUrl).finally(() => {
      this.inFlightEncodes.delete(longUrl);
    });
    this.inFlightEncodes.set(longUrl, encoding);
    return encoding;
  }

  private async doEncode(longUrl: string): Promise<EncodeResult> {
    const existing = await this.urlRepository.findByLongUrl(longUrl);
    if (existing) {
      return { record: existing, wasCreated: false };
    }

    const shortPath = await this.generateUniqueShortPath();
    const record = await this.urlRepository.save(
      createUrlRecord(shortPath, longUrl)
    );
    return { record, wasCreated: true };
  }

  async visit(shortPath: string): Promise<UrlRecord> {
    const updated = await this.urlRepository.recordVisit(shortPath, new Date());
    if (updated === null) {
      throw new UrlNotFoundError(shortPath);
    }
    return updated;
  }

  /** Newest first; optional case-insensitive substring match on long URLs. */
  async list(search?: string): Promise<UrlRecord[]> {
    const records = await this.urlRepository.findAll();
    const needle = search?.toLowerCase();
    const filtered = needle
      ? records.filter((record) =>
          record.longUrl.toLowerCase().includes(needle)
        )
      : records;

    return filtered.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async decode(shortPath: string): Promise<UrlRecord> {
    const record = await this.urlRepository.findByShortPath(shortPath);
    if (record === null) {
      throw new UrlNotFoundError(shortPath);
    }
    return record;
  }

  private async generateUniqueShortPath(): Promise<string> {
    for (
      let attempt = 0;
      attempt < MAX_SLUG_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      const candidate = this.generateSlug();
      if ((await this.urlRepository.findByShortPath(candidate)) === null) {
        return candidate;
      }
    }
    throw new SlugGenerationError(MAX_SLUG_GENERATION_ATTEMPTS);
  }
}
