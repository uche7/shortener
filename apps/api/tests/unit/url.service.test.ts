import { beforeEach, describe, expect, it } from "vitest";
import { MAX_SLUG_GENERATION_ATTEMPTS } from "../../src/constants/url";
import { SlugGenerationError } from "../../src/errors/slug-generation-error";
import { UrlNotFoundError } from "../../src/errors/url-not-found-error";
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

  it("keeps encode idempotent under concurrent calls for the same URL", async () => {
    const service = new UrlService(
      repository,
      slugSequence("aaaaaa", "bbbbbb")
    );

    const [first, second] = await Promise.all([
      service.encode("https://indicina.co"),
      service.encode("https://indicina.co"),
    ]);

    expect(first.record.shortPath).toBe(second.record.shortPath);
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

  it("decodes an existing short path back to its record", async () => {
    const service = new UrlService(repository, slugSequence("GeAi9K"));
    await service.encode("https://indicina.co");

    const record = await service.decode("GeAi9K");

    expect(record.longUrl).toBe("https://indicina.co");
  });

  it("throws UrlNotFoundError when decoding an unknown short path", async () => {
    const service = new UrlService(repository);

    await expect(service.decode("nope42")).rejects.toThrow(UrlNotFoundError);
  });

  it("records a visit and returns the updated record", async () => {
    const service = new UrlService(repository, slugSequence("GeAi9K"));
    await service.encode("https://indicina.co");

    const first = await service.visit("GeAi9K");
    const second = await service.visit("GeAi9K");

    expect(first.visitCount).toBe(1);
    expect(second.visitCount).toBe(2);
    expect(second.firstVisitedAt).toEqual(first.firstVisitedAt);
    expect(second.lastVisitedAt?.getTime()).toBeGreaterThanOrEqual(
      first.lastVisitedAt?.getTime() as number
    );
  });

  it("throws UrlNotFoundError when visiting an unknown short path", async () => {
    const service = new UrlService(repository);

    await expect(service.visit("nope42")).rejects.toThrow(UrlNotFoundError);
  });

  it("lists records newest first", async () => {
    const service = new UrlService(repository);
    await repository.save({
      ...createUrlRecord("older1", "https://old.test"),
      createdAt: new Date("2026-07-01T00:00:00Z"),
    });
    await repository.save({
      ...createUrlRecord("newer1", "https://new.test"),
      createdAt: new Date("2026-07-10T00:00:00Z"),
    });

    const records = await service.list();

    expect(records.map((record) => record.shortPath)).toEqual([
      "newer1",
      "older1",
    ]);
  });

  it("filters the list case-insensitively on long URLs", async () => {
    const service = new UrlService(repository);
    await repository.save(createUrlRecord("aaaaaa", "https://indicina.co"));
    await repository.save(createUrlRecord("bbbbbb", "https://google.com"));

    const records = await service.list("INDICINA");

    expect(records).toHaveLength(1);
    expect(records[0]?.shortPath).toBe("aaaaaa");
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
