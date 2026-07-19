import type { NextFunction, Request, Response } from "express";
import type { ZodError, ZodType } from "zod";
import { ValidationError } from "../errors/validation-error";

function toIssueDetails(error: ZodError) {
  return {
    issues: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  };
}

/**
 * Validates and replaces req.body with the parsed (trimmed, typed) result,
 * so downstream handlers only ever see schema-conforming input.
 */
export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(
        new ValidationError(
          "Invalid request body",
          toIssueDetails(result.error)
        )
      );
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * req.query is a read-only getter in Express 5, so the parsed result is
 * exposed via res.locals.validatedQuery instead of being written back.
 */
export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(
        new ValidationError(
          "Invalid query parameters",
          toIssueDetails(result.error)
        )
      );
      return;
    }
    res.locals.validatedQuery = result.data;
    next();
  };
}
