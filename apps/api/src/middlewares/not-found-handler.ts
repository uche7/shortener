import type { Request, Response } from "express";
import { HTTP_STATUS } from "../constants/http";
import { sendError } from "../utils/api-response";

/** Terminal middleware: any request no route claimed gets a JSON 404. */
export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: `Route ${req.method} ${req.path} not found`,
  });
}
