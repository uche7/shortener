import type { Express } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";

describe("POST /api/decode", () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
  });

  async function encodeUrl(longUrl: string): Promise<string> {
    const response = await request(app)
      .post("/api/encode")
      .send({ url: longUrl });
    return response.body.data.shortUrl as string;
  }

  it("decodes a full short URL back to the original URL", async () => {
    const shortUrl = await encodeUrl("https://indicina.co");

    const response = await request(app).post("/api/decode").send({ shortUrl });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Short URL decoded");
    expect(response.body.data.longUrl).toBe("https://indicina.co");
  });

  it.each([
    ["bare short path", (path: string) => path],
    ["path with leading slash", (path: string) => `/${path}`],
  ])("decodes a %s", async (_label, shape) => {
    const shortUrl = await encodeUrl("https://indicina.co");
    const shortPath = shortUrl.split("/").pop() as string;

    const response = await request(app)
      .post("/api/decode")
      .send({ shortUrl: shape(shortPath) });

    expect(response.status).toBe(200);
    expect(response.body.data.longUrl).toBe("https://indicina.co");
  });

  it("returns a 404 envelope for an unknown short path", async () => {
    const response = await request(app)
      .post("/api/decode")
      .send({ shortUrl: "http://localhost:4000/unKn0w" });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("unKn0w");
  });

  it("rejects a missing shortUrl field with a 400", async () => {
    const response = await request(app).post("/api/decode").send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.issues).toEqual([
      expect.objectContaining({ path: "shortUrl" }),
    ]);
  });

  it("rejects input that contains no plausible short path", async () => {
    const response = await request(app)
      .post("/api/decode")
      .send({ shortUrl: "http://localhost:4000/a/b" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
