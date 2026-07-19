import { UrlController } from "./controllers/url.controller";
import type { UrlRepository } from "./interfaces/url-repository.interface";
import { InMemoryUrlRepository } from "./repositories/in-memory-url.repository";
import { UrlService } from "./services/url.service";

/**
 * Composition root: the only place concrete implementations are chosen.
 * Swapping the datastore means changing one line here.
 */
export interface Container {
  urlRepository: UrlRepository;
  urlService: UrlService;
  urlController: UrlController;
}

export function createContainer(): Container {
  const urlRepository = new InMemoryUrlRepository();
  const urlService = new UrlService(urlRepository);
  const urlController = new UrlController(urlService);

  return { urlRepository, urlService, urlController };
}
