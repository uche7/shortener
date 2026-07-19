import { beforeEach, describe, expect, it } from "vitest";
import { MAX_SLUG_GENERATION_ATTEMPTS } from "../../src/constants/url";
import { SlugGenerationError } from "../../src/errors/slug-generation-error";
import { createUrlRecord } from "../../src/models/url.model";
import { InMemoryUrlRepository } from "../../src/repositories/in-memory-url.repository";
import { UrlService, type SlugGenerator } from "../../src/services/url.service";

function slugSequence(...slugs: string[]): SlugGenerator {
  let index = 0;
  return () => slugs[Math.min(index++, slugs.length - 1)] as string;
}

describe("UrlService.encode", () => {
  let repository: InMemoryUrlRepository;

  beforeEach(() => {
    repository = new InMemoryUrlRepository();
  });

  it("creates a record with a generated short path", async () => {
    const service = new UrlService(repository, slugSequence("GeAi9K"));

    const { record, wasCreated } = await service.encode("https://indicina.co");

    expect(wasCreated).toBe(true);
    expect(record.shortPath).toBe("GeAi9K");
    expect(record.longUrl).toBe("https://indicina.co");
    expect(record.visitCount).toBe(0);
  });

  it("returns the existing record when the URL was already encoded", async () => {
    const service = new UrlService(
      repository,
      slugSequence("aaaaaa", "bbbbbb")
    );

    const first = await service.encode("https://indicina.co");
    const second = await service.encode("https://indicina.co");

    expect(second.wasCreated).toBe(false);
    expect(second.record.shortPath).toBe(first.record.shortPath);
    expect(await repository.findAll()).toHaveLength(1);
  });

  it("retries on slug collision until a free slug is found", async () => {
    await repository.save(createUrlRecord("taken1", "https://taken.test"));
    const service = new UrlService(
      repository,
      slugSequence("taken1", "free22")
    );

    const { record } = await service.encode("https://indicina.co");

    expect(record.shortPath).toBe("free22");
  });

  it("fails with SlugGenerationError when the retry budget is exhausted", async () => {
    await repository.save(createUrlRecord("taken1", "https://taken.test"));
    const alwaysColliding: SlugGenerator = () => "taken1";
    const service = new UrlService(repository, alwaysColliding);

    await expect(service.encode("https://indicina.co")).rejects.toThrow(
      SlugGenerationError
    );
    await expect(service.encode("https://indicina.co")).rejects.toThrow(
      new RegExp(`${MAX_SLUG_GENERATION_ATTEMPTS} attempts`)
    );
  });
});
