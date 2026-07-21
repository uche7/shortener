import type { Express } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { MAX_URL_LENGTH } from "../../src/constants/url";
import { createApp } from "../../src/app";

describe("API edge cases", () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
  });

  function urlOfLength(totalLength: number): string {
    const prefix = "https://example.com/";
    return prefix + "a".repeat(totalLength - prefix.length);
  }

  it("accepts a URL exactly at the maximum length", async () => {
    const response = await request(app)
      .post("/api/encode")
      .send({ url: urlOfLength(MAX_URL_LENGTH) });

    expect(response.status).toBe(201);
  });

  it("rejects a URL one character over the maximum length", async () => {
    const response = await request(app)
      .post("/api/encode")
      .send({ url: urlOfLength(MAX_URL_LENGTH + 1) });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("round-trips URLs with query strings and unicode paths", async () => {
    const longUrl = "https://example.com/路径/search?q=café&page=2#results";

    const encoded = await request(app)
      .post("/api/encode")
      .send({ url: longUrl });
    const decoded = await request(app)
      .post("/api/decode")
      .send({ shortUrl: encoded.body.data.shortUrl });

    expect(decoded.status).toBe(200);
    expect(decoded.body.data.longUrl).toBe(longUrl);
  });

  it("returns the JSON 404 envelope for routes no router claims", async () => {
    const posted = await request(app).post("/api/unknown").send({});
    const nested = await request(app).get("/some/nested/path");

    expect(posted.status).toBe(404);
    expect(posted.body).toEqual({
      success: false,
      message: "Route POST /api/unknown not found",
    });
    expect(nested.status).toBe(404);
    expect(nested.body.success).toBe(false);
  });

  it("rejects decode input that is neither a URL nor a slug", async () => {
    const response = await request(app)
      .post("/api/decode")
      .send({ shortUrl: "!!!" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("allows cross-origin requests via CORS", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "https://example.com");

    expect(response.headers["access-control-allow-origin"]).toBe("*");
  });

  it("creates a single record when the same URL is encoded concurrently", async () => {
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        request(app).post("/api/encode").send({ url: "https://indicina.co" })
      )
    );

    const shortPaths = new Set(
      responses.map((response) => response.body.data.shortPath)
    );
    expect(shortPaths.size).toBe(1);

    const list = await request(app).get("/api/list");
    expect(list.body.data.total).toBe(1);
  });
});
