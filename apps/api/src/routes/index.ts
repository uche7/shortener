import { Router } from "express";
import type { Container } from "../container";
import { healthRouter } from "./health.routes";
import { createUrlRouter } from "./url.routes";

export function createApiRouter(container: Container): Router {
  const router = Router();

  router.use("/health", healthRouter);
  router.use("/", createUrlRouter(container.urlController));

  return router;
}
