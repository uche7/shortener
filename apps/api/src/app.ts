import cors from "cors";
import express, { type Express } from "express";
import { config } from "./config/env";
import { createContainer, type Container } from "./container";
import { errorHandler } from "./middlewares/error-handler";
import { notFoundHandler } from "./middlewares/not-found-handler";
import { requestLogger } from "./middlewares/request-logger";
import { createApiRouter } from "./routes/index";
import { createRedirectRouter } from "./routes/redirect.routes";

/**
 * App factory, separate from the HTTP listener so integration tests can
 * exercise the full middleware pipeline via Supertest without opening a port.
 * Each call gets a fresh container, so tests are isolated by construction.
 */
export function createApp(container: Container = createContainer()): Express {
  const app = express();

  app.disable("x-powered-by");
  /* Permissive CORS is intentional: the API is public for programmatic
   * integration per the assignment brief. */
  app.use(cors());
  app.use(express.json());
  if (config.nodeEnv !== "test") {
    app.use(requestLogger);
  }

  app.use("/api", createApiRouter(container));
  app.use("/", createRedirectRouter(container.urlController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
