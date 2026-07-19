import { Router } from "express";
import { healthRouter } from "./health.routes";

/** Aggregates every /api/* sub-router in one place. */
export const apiRouter: Router = Router();

apiRouter.use("/health", healthRouter);
