import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ValidationError } from "../errors/validation-error";

/**
 * Validates and replaces req.body with the parsed (trimmed, typed) result,
 * so downstream handlers only ever see schema-conforming input.
 */
export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(
        new ValidationError("Invalid request body", {
          issues: result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        })
      );
      return;
    }
    req.body = result.data;
    next();
  };
}
