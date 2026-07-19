import { HTTP_STATUS } from "../constants/http";
import { AppError } from "./app-error";

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, HTTP_STATUS.BAD_REQUEST, details);
  }
}
