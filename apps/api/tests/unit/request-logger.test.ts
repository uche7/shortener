import { EventEmitter } from "node:events";
import type { NextFunction, Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { requestLogger } from "../../src/middlewares/request-logger";

describe("requestLogger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls next immediately and logs once the response finishes", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const req = { method: "GET", originalUrl: "/api/list" } as Request;
    const res = new EventEmitter() as unknown as Response;
    (res as { statusCode: number }).statusCode = 200;
    const next = vi.fn() as unknown as NextFunction;

    requestLogger(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(infoSpy).not.toHaveBeenCalled();

    (res as unknown as EventEmitter).emit("finish");

    expect(infoSpy).toHaveBeenCalledOnce();
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/api\/list 200 \d+(\.\d+)?ms$/)
    );
  });
});
