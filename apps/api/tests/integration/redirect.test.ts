import type { Express } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";

describe("GET /:shortPath (redirect)", () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
  });

  async function encodeUrl(longUrl: string): Promise<string> {
    const response = await request(app)
      .post("/api/encode")
      .send({ url: longUrl });
    return response.body.data.shortPath as string;
  }

  it("redirects to the original URL with a 302", async () => {
    const shortPath = await encodeUrl("https://indicina.co");

    const response = await request(app).get(`/${shortPath}`);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("https://indicina.co");
  });

  it("records visits that are visible through the decode endpoint", async () => {
    const shortPath = await encodeUrl("https://indicina.co");

    await request(app).get(`/${shortPath}`);
    await request(app).get(`/${shortPath}`);
    const decoded = await request(app)
      .post("/api/decode")
      .send({ shortUrl: shortPath });

    expect(decoded.body.data.visitCount).toBe(2);
    expect(decoded.body.data.firstVisitedAt).not.toBeNull();
    expect(decoded.body.data.lastVisitedAt).not.toBeNull();
  });

  it("returns a JSON 404 envelope for an unknown short path", async () => {
    const response = await request(app).get("/unKn0w");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("unKn0w");
  });

  it("returns a 404 for paths that are not Base62 slugs", async () => {
    const response = await request(app).get("/favicon.ico");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("does not shadow API routes", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
