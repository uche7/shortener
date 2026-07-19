import type { Request, Response } from "express";
import { config } from "../config/env";
import { sendSuccess } from "../utils/api-response";

export function getHealth(_req: Request, res: Response): void {
  sendSuccess(res, {
    message: "API is healthy",
    data: {
      status: "ok",
      environment: config.nodeEnv,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
}
