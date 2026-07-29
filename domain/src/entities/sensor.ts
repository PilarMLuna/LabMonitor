import { ValidationError } from "../errors/validation-error.js";

export type SensorStatus = "active" | "inactive";

export interface SensorProperties {
  id: string;
  experimentId: string;
  name: string;
  minThreshold: number;
  maxThreshold: number;
  status?: SensorStatus;
}

export class Sensor {
  readonly id: string;
  readonly experimentId: string;
  readonly name: string;
  readonly minThreshold: number;
  readonly maxThreshold: number;
  private currentStatus: SensorStatus;

  constructor(properties: SensorProperties) {
    if (!properties.id.trim()) {
      throw new ValidationError("Sensor id is required");
    }

    if (!properties.experimentId.trim()) {
      throw new ValidationError("Sensor experiment id is required");
    }

    if (!properties.name.trim()) {
      throw new ValidationError("Sensor name is required");
    }

    if (!Number.isFinite(properties.minThreshold) || !Number.isFinite(properties.maxThreshold)) {
      throw new ValidationError("Sensor thresholds must be finite numbers");
    }

    if (properties.minThreshold > properties.maxThreshold) {
      throw new ValidationError("Sensor minimum threshold cannot exceed maximum threshold");
    }

    this.id = properties.id;
    this.experimentId = properties.experimentId;
    this.name = properties.name;
    this.minThreshold = properties.minThreshold;
    this.maxThreshold = properties.maxThreshold;
    this.currentStatus = properties.status ?? "active";
  }

  get status(): SensorStatus {
    return this.currentStatus;
  }

  activate(): void {
    this.currentStatus = "active";
  }

  deactivate(): void {
    this.currentStatus = "inactive";
  }

  isValueOutOfRange(value: number): boolean {
    return value < this.minThreshold || value > this.maxThreshold;
  }
}
