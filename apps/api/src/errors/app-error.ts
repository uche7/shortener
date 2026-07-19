import { HTTP_STATUS, type HttpStatus } from "../constants/http";

/**
 * Base class for all expected (operational) errors. The global error handler
 * translates these into the standard JSON error envelope; anything that is
 * not an AppError is treated as an unexpected fault and returned as a 500.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: HttpStatus = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, new.target);
  }
}
