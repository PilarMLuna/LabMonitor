import { DomainError } from "./domain-error.js";

export class InvalidOperationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidOperationError";
  }
}
