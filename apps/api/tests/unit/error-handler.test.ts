import type { NextFunction, Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../src/errors/app-error";
import { errorHandler } from "../../src/middlewares/error-handler";

function mockResponse(): Response {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res as unknown as Response;
}

const req = {} as Request;
const next = vi.fn() as unknown as NextFunction;

describe("errorHandler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps AppError to its status code and envelope", () => {
    const res = mockResponse();

    errorHandler(new AppError("Teapot refused", 400), req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Teapot refused",
    });
  });

  it("hides details of unexpected errors behind a generic 500", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = mockResponse();

    errorHandler(new Error("db password is hunter2"), req, res, next);

    expect(errorSpy).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});
