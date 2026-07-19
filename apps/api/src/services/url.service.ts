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

  /** Idempotent: encoding an already-shortened URL returns its existing record. */
  async encode(longUrl: string): Promise<EncodeResult> {
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
