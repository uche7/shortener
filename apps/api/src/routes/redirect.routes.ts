import { Router } from "express";
import type { UrlController } from "../controllers/url.controller";

export function createRedirectRouter(controller: UrlController): Router {
  const router = Router();

  router.get("/:shortPath", controller.redirect);

  return router;
}
