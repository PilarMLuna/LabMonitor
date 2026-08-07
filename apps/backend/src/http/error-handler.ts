import {
  DomainError,
  InvalidOperationError,
  NotFoundError,
  ValidationError,
} from "@lab-monitor/domain";
import type { ErrorRequestHandler } from "express";

import { RequestValidationError } from "./request-validation.js";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  if (error instanceof RequestValidationError) {
    response.status(400).json(errorResponse("INVALID_REQUEST", error.message));
    return;
  }

  if (error instanceof NotFoundError) {
    response.status(404).json(errorResponse("NOT_FOUND", error.message));
    return;
  }

  if (error instanceof InvalidOperationError) {
    response.status(409).json(errorResponse("INVALID_OPERATION", error.message));
    return;
  }

  if (error instanceof ValidationError || error instanceof DomainError) {
    response.status(400).json(errorResponse("DOMAIN_ERROR", error.message));
    return;
  }

  if (error instanceof SyntaxError) {
    response
      .status(400)
      .json(errorResponse("INVALID_JSON", "Request body contains invalid JSON"));
    return;
  }

  response
    .status(500)
    .json(errorResponse("INTERNAL_ERROR", "An unexpected error occurred"));
};

function errorResponse(code: string, message: string) {
  return { error: { code, message } };
}
