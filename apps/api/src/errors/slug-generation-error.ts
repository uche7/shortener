import { HTTP_STATUS } from "../constants/http";
import { AppError } from "./app-error";

export class SlugGenerationError extends AppError {
  constructor(attempts: number) {
    super(
      `Could not generate a unique short path after ${attempts} attempts`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
