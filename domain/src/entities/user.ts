import { ValidationError } from "../errors/validation-error.js";

export type UserRole = "admin" | "researcher" | "technician" | "viewer";

export interface UserProperties {
  id: string;
  name: string;
  role: UserRole;
}

export class User {
  readonly id: string;
  readonly name: string;
  readonly role: UserRole;

  constructor(properties: UserProperties) {
    if (!properties.id.trim()) {
      throw new ValidationError("User id is required");
    }

    if (!properties.name.trim()) {
      throw new ValidationError("User name is required");
    }

    this.id = properties.id;
    this.name = properties.name;
    this.role = properties.role;
  }
}
