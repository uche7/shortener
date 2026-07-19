import type { Express } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";

describe("GET /api/statistic/:shortPath", () => {
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

  it("returns statistics for a short URL", async () => {
    const shortPath = await encodeUrl("https://indicina.co/careers");

    const response = await request(app).get(`/api/statistic/${shortPath}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Short URL statistics");
    expect(response.body.data).toMatchObject({
      shortPath,
      longUrl: "https://indicina.co/careers",
      longUrlDomain: "indicina.co",
      visitCount: 0,
      hasBeenVisited: false,
      ageInDays: 0,
      averageVisitsPerDay: 0,
      daysSinceLastVisit: null,
    });
  });

  it("reflects visits made through the redirect endpoint", async () => {
    const shortPath = await encodeUrl("https://indicina.co");

    await request(app).get(`/${shortPath}`);
    await request(app).get(`/${shortPath}`);
    const response = await request(app).get(`/api/statistic/${shortPath}`);

    expect(response.body.data.visitCount).toBe(2);
    expect(response.body.data.hasBeenVisited).toBe(true);
    expect(response.body.data.firstVisitedAt).not.toBeNull();
    expect(response.body.data.daysSinceLastVisit).toBe(0);
  });

  it("returns a 404 envelope for an unknown short path", async () => {
    const response = await request(app).get("/api/statistic/unKn0w");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("unKn0w");
  });

  it("returns a 404 for a malformed short path", async () => {
    const response = await request(app).get("/api/statistic/not-a-slug!");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
