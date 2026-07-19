import { HTTP_STATUS } from "../constants/http";
import { AppError } from "./app-error";

export class UrlNotFoundError extends AppError {
  constructor(shortPath: string) {
    super(`No URL found for short path "${shortPath}"`, HTTP_STATUS.NOT_FOUND);
  }
}
