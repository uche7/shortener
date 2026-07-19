import express, { type Express } from "express";
import { config } from "./config/env";
import { errorHandler } from "./middlewares/error-handler";
import { notFoundHandler } from "./middlewares/not-found-handler";
import { requestLogger } from "./middlewares/request-logger";
import { apiRouter } from "./routes/index";

/**
 * App factory, separate from the HTTP listener so integration tests can
 * exercise the full middleware pipeline via Supertest without opening a port.
 */
export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());
  if (config.nodeEnv !== "test") {
    app.use(requestLogger);
  }

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
