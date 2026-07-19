import type { Response } from "express";
import { HTTP_STATUS, type HttpStatus } from "../constants/http";

interface SuccessPayload<T> {
  message: string;
  data?: T;
  statusCode?: HttpStatus;
}

interface ErrorPayload {
  message: string;
  error?: unknown;
  statusCode: HttpStatus;
}

/** Single source of the `{ success, message, data }` success envelope. */
export function sendSuccess<T>(
  res: Response,
  payload: SuccessPayload<T>
): Response {
  const { message, data, statusCode = HTTP_STATUS.OK } = payload;
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
  });
}

/** Single source of the `{ success, message, error }` error envelope. */
export function sendError(res: Response, payload: ErrorPayload): Response {
  const { message, error, statusCode } = payload;
  return res.status(statusCode).json({
    success: false,
    message,
    ...(error !== undefined && { error }),
  });
}
