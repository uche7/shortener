import type { Request, Response } from "express";
import { config } from "../config/env";
import { HTTP_STATUS } from "../constants/http";
import { toUrlDto } from "../helpers/url-mapper";
import type { UrlService } from "../services/url.service";
import type { DecodeRequestDto } from "../validators/decode.validator";
import type { EncodeRequestDto } from "../validators/encode.validator";
import { sendSuccess } from "../utils/api-response";

export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  /* Handlers are arrow properties so `this` survives being passed to Express. */

  encode = async (req: Request, res: Response): Promise<void> => {
    const { url } = req.body as EncodeRequestDto;
    const { record, wasCreated } = await this.urlService.encode(url);

    sendSuccess(res, {
      statusCode: wasCreated ? HTTP_STATUS.CREATED : HTTP_STATUS.OK,
      message: wasCreated
        ? "Short URL created"
        : "URL was already shortened; returning existing short URL",
      data: toUrlDto(record, config.baseUrl),
    });
  };

  decode = async (req: Request, res: Response): Promise<void> => {
    const { shortPath } = req.body as DecodeRequestDto;
    const record = await this.urlService.decode(shortPath);

    sendSuccess(res, {
      message: "Short URL decoded",
      data: toUrlDto(record, config.baseUrl),
    });
  };
}
