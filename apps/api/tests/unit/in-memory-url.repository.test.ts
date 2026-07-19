import { beforeEach, describe, expect, it } from "vitest";
import { createUrlRecord } from "../../src/models/url.model";
import { InMemoryUrlRepository } from "../../src/repositories/in-memory-url.repository";

describe("InMemoryUrlRepository", () => {
  let repository: InMemoryUrlRepository;

  beforeEach(() => {
    repository = new InMemoryUrlRepository();
  });

  it("saves a record and finds it by short path", async () => {
    await repository.save(createUrlRecord("GeAi9K", "https://indicina.co"));

    const found = await repository.findByShortPath("GeAi9K");
    expect(found).not.toBeNull();
    expect(found?.longUrl).toBe("https://indicina.co");
    expect(found?.visitCount).toBe(0);
  });

  it("finds a record by long URL", async () => {
    await repository.save(createUrlRecord("GeAi9K", "https://indicina.co"));

    const found = await repository.findByLongUrl("https://indicina.co");
    expect(found?.shortPath).toBe("GeAi9K");
  });

  it("returns null for unknown lookups", async () => {
    expect(await repository.findByShortPath("nope")).toBeNull();
    expect(await repository.findByLongUrl("https://unknown.test")).toBeNull();
  });

  it("lists all records in insertion order", async () => {
    await repository.save(createUrlRecord("aaaaaa", "https://a.test"));
    await repository.save(createUrlRecord("bbbbbb", "https://b.test"));

    const all = await repository.findAll();
    expect(all.map((record) => record.shortPath)).toEqual(["aaaaaa", "bbbbbb"]);
  });

  it("records visits: counter plus first and last visit timestamps", async () => {
    await repository.save(createUrlRecord("GeAi9K", "https://indicina.co"));
    const firstVisit = new Date("2026-07-19T10:00:00Z");
    const secondVisit = new Date("2026-07-19T11:00:00Z");

    await repository.recordVisit("GeAi9K", firstVisit);
    const updated = await repository.recordVisit("GeAi9K", secondVisit);

    expect(updated?.visitCount).toBe(2);
    expect(updated?.firstVisitedAt).toEqual(firstVisit);
    expect(updated?.lastVisitedAt).toEqual(secondVisit);
  });

  it("returns null when recording a visit for an unknown path", async () => {
    expect(await repository.recordVisit("nope", new Date())).toBeNull();
  });

  it("is immune to mutation of returned records", async () => {
    const saved = await repository.save(
      createUrlRecord("GeAi9K", "https://indicina.co")
    );

    (saved as { longUrl: string }).longUrl = "https://evil.test";

    const found = await repository.findByShortPath("GeAi9K");
    expect(found?.longUrl).toBe("https://indicina.co");
  });
});
