import type { Request, Response } from "express";
import { config } from "../config/env";
import { HTTP_STATUS } from "../constants/http";
import { SHORT_PATH_PATTERN } from "../constants/url";
import { UrlNotFoundError } from "../errors/url-not-found-error";
import { toUrlDto, toUrlStatsDto } from "../helpers/url-mapper";
import type { UrlService } from "../services/url.service";
import type { UrlListDto } from "../types/url.dto";
import type { DecodeRequestDto } from "../validators/decode.validator";
import type { EncodeRequestDto } from "../validators/encode.validator";
import type { ListQueryDto } from "../validators/list.validator";
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

  list = async (_req: Request, res: Response): Promise<void> => {
    const { search } = res.locals.validatedQuery as ListQueryDto;
    const records = await this.urlService.list(search);
    const payload: UrlListDto = {
      urls: records.map((record) => toUrlDto(record, config.baseUrl)),
      total: records.length,
    };

    sendSuccess(res, {
      message: search
        ? `Short URLs with long URLs matching "${search}"`
        : "All short URLs",
      data: payload,
    });
  };

  /* 302 rather than 301: browsers cache 301s permanently, which would
   * bypass the server on repeat visits and break visit counting. */
  redirect = async (req: Request, res: Response): Promise<void> => {
    const shortPath = this.shortPathParam(req);
    const record = await this.urlService.visit(shortPath);
    res.redirect(HTTP_STATUS.FOUND, record.longUrl);
  };

  statistics = async (req: Request, res: Response): Promise<void> => {
    const shortPath = this.shortPathParam(req);
    const record = await this.urlService.decode(shortPath);

    sendSuccess(res, {
      message: "Short URL statistics",
      data: toUrlStatsDto(record, config.baseUrl),
    });
  };

  /* Express 5 dropped inline param regexes, so slug shape is guarded here. */
  private shortPathParam(req: Request): string {
    const shortPath = req.params.shortPath as string;
    if (!SHORT_PATH_PATTERN.test(shortPath)) {
      throw new UrlNotFoundError(shortPath);
    }
    return shortPath;
  }
}
