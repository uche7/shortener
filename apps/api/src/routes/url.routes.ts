import { Router } from "express";
import type { UrlController } from "../controllers/url.controller";
import { validateBody } from "../middlewares/validate-request";
import { decodeRequestSchema } from "../validators/decode.validator";
import { encodeRequestSchema } from "../validators/encode.validator";

export function createUrlRouter(controller: UrlController): Router {
  const router = Router();

  router.post("/encode", validateBody(encodeRequestSchema), controller.encode);
  router.post("/decode", validateBody(decodeRequestSchema), controller.decode);
  router.get("/statistic/:shortPath", controller.statistics);

  return router;
}
