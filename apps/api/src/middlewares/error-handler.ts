import type { NextFunction, Request, Response } from "express";
import { config } from "../config/env";
import { HTTP_STATUS } from "../constants/http";
import { AppError } from "../errors/app-error";
import { sendError } from "../utils/api-response";

/**
 * Global error handler. Express identifies error middleware by its arity,
 * so all four parameters must be declared even when unused.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    sendError(res, {
      statusCode: err.statusCode,
      message: err.message,
      error: err.details,
    });
    return;
  }

  console.error("Unexpected error:", err);
  sendError(res, {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: "Internal server error",
    error:
      config.nodeEnv === "development" && err instanceof Error
        ? { detail: err.message }
        : undefined,
  });
}
