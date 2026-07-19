import type { Express } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";

describe("GET /api/list", () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
  });

  async function encodeUrl(longUrl: string): Promise<void> {
    await request(app).post("/api/encode").send({ url: longUrl });
  }

  it("returns an empty list when nothing has been shortened", async () => {
    const response = await request(app).get("/api/list");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("All short URLs");
    expect(response.body.data).toEqual({ urls: [], total: 0 });
  });

  it("lists every shortened URL", async () => {
    await encodeUrl("https://indicina.co");
    await encodeUrl("https://google.com");

    const response = await request(app).get("/api/list");

    expect(response.body.data.total).toBe(2);
    const longUrls = response.body.data.urls.map(
      (url: { longUrl: string }) => url.longUrl
    );
    expect(longUrls).toEqual(
      expect.arrayContaining(["https://indicina.co", "https://google.com"])
    );
  });

  it("filters by search term across long URLs", async () => {
    await encodeUrl("https://indicina.co/careers");
    await encodeUrl("https://google.com");

    const response = await request(app).get("/api/list?search=indicina");

    expect(response.body.data.total).toBe(1);
    expect(response.body.data.urls[0].longUrl).toBe(
      "https://indicina.co/careers"
    );
    expect(response.body.message).toContain("indicina");
  });

  it("matches case-insensitively", async () => {
    await encodeUrl("https://indicina.co");

    const response = await request(app).get("/api/list?search=INDICINA");

    expect(response.body.data.total).toBe(1);
  });

  it("rejects a search term shorter than 3 characters with a 400", async () => {
    const response = await request(app).get("/api/list?search=ab");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.issues).toEqual([
      expect.objectContaining({ path: "search" }),
    ]);
  });

  it("treats an empty search parameter as no filter", async () => {
    await encodeUrl("https://indicina.co");

    const response = await request(app).get("/api/list?search=");

    expect(response.status).toBe(200);
    expect(response.body.data.total).toBe(1);
  });
});
