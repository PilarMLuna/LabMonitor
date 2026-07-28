import { DomainError } from "./domain-error";

export class NotFoundError extends DomainError {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id "${id}" was not found`);
    this.name = "NotFoundError";
  }
}
