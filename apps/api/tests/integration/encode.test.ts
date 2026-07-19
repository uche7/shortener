import type { Express } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";

describe("POST /api/encode", () => {
  let app: Express;

  beforeEach(() => {
    app = createApp();
  });

  it("encodes a URL and returns a 201 with the envelope and short URL", async () => {
    const response = await request(app)
      .post("/api/encode")
      .send({ url: "https://indicina.co" });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Short URL created");
    expect(response.body.data.longUrl).toBe("https://indicina.co");
    expect(response.body.data.shortPath).toMatch(/^[0-9A-Za-z]{6}$/);
    expect(response.body.data.shortUrl).toBe(
      `http://localhost:4000/${response.body.data.shortPath}`
    );
    expect(response.body.data.visitCount).toBe(0);
    expect(response.body.data.firstVisitedAt).toBeNull();
  });

  it("is idempotent: encoding the same URL again returns 200 and the same path", async () => {
    const first = await request(app)
      .post("/api/encode")
      .send({ url: "https://indicina.co" });
    const second = await request(app)
      .post("/api/encode")
      .send({ url: "https://indicina.co" });

    expect(second.status).toBe(200);
    expect(second.body.success).toBe(true);
    expect(second.body.data.shortPath).toBe(first.body.data.shortPath);
  });

  it("trims surrounding whitespace before encoding", async () => {
    const response = await request(app)
      .post("/api/encode")
      .send({ url: "  https://indicina.co  " });

    expect(response.status).toBe(201);
    expect(response.body.data.longUrl).toBe("https://indicina.co");
  });

  it("rejects a missing url field with a 400 and issue details", async () => {
    const response = await request(app).post("/api/encode").send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid request body");
    expect(response.body.error.issues).toEqual([
      expect.objectContaining({ path: "url" }),
    ]);
  });

  it.each([
    ["not a URL at all", "not-a-url"],
    ["missing protocol", "indicina.co"],
    ["unsupported protocol", "ftp://indicina.co"],
    ["empty string", ""],
  ])("rejects an invalid url (%s) with a 400", async (_label, url) => {
    const response = await request(app).post("/api/encode").send({ url });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects malformed JSON with a 400 envelope", async () => {
    const response = await request(app)
      .post("/api/encode")
      .set("Content-Type", "application/json")
      .send('{"url": ');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "Malformed JSON body",
    });
  });
});
