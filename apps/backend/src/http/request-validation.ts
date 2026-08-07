export class RequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestValidationError";
  }
}

export function readBody(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new RequestValidationError("Request body must be a JSON object");
  }

  return value as Record<string, unknown>;
}

export function readString(
  body: Record<string, unknown>,
  field: string,
): string {
  const value = body[field];

  if (typeof value !== "string" || !value.trim()) {
    throw new RequestValidationError(`${field} must be a non-empty string`);
  }

  return value.trim();
}

export function readRouteParameter(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new RequestValidationError(`${name} must be a non-empty string`);
  }

  return value.trim();
}

export function readNumber(
  body: Record<string, unknown>,
  field: string,
): number {
  const value = body[field];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new RequestValidationError(`${field} must be a finite number`);
  }

  return value;
}

export function readDate(
  body: Record<string, unknown>,
  field: string,
): Date {
  const value = body[field];

  if (typeof value !== "string") {
    throw new RequestValidationError(`${field} must be an ISO date string`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new RequestValidationError(`${field} must be a valid ISO date string`);
  }

  return date;
}
