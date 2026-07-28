import { ValidationError } from "../errors/validation-error";

export type ExperimentStatus = "draft" | "running" | "paused" | "finished";

export interface ExperimentProperties {
  id: string;
  name: string;
  ownerId: string;
  status?: ExperimentStatus;
}

export class Experiment {
  readonly id: string;
  readonly name: string;
  readonly ownerId: string;
  private currentStatus: ExperimentStatus;

  constructor(properties: ExperimentProperties) {
    if (!properties.id.trim()) {
      throw new ValidationError("Experiment id is required");
    }

    if (!properties.name.trim()) {
      throw new ValidationError("Experiment name is required");
    }

    if (!properties.ownerId.trim()) {
      throw new ValidationError("Experiment owner id is required");
    }

    this.id = properties.id;
    this.name = properties.name;
    this.ownerId = properties.ownerId;
    this.currentStatus = properties.status ?? "draft";
  }

  get status(): ExperimentStatus {
    return this.currentStatus;
  }

  changeStatus(status: ExperimentStatus): void {
    this.currentStatus = status;
  }
}
