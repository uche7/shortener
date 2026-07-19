import { Router } from "express";
import type { UrlController } from "../controllers/url.controller";
import { validateBody } from "../middlewares/validate-request";
import { encodeRequestSchema } from "../validators/encode.validator";

export function createUrlRouter(controller: UrlController): Router {
  const router = Router();

  router.post("/encode", validateBody(encodeRequestSchema), controller.encode);

  return router;
}
