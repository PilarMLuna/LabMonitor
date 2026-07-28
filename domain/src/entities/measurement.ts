import { ValidationError } from "../errors/validation-error";

export interface MeasurementProperties {
  id: string;
  sensorId: string;
  value: number;
  measuredAt: Date;
}

export class Measurement {
  readonly id: string;
  readonly sensorId: string;
  readonly value: number;
  readonly measuredAt: Date;

  constructor(properties: MeasurementProperties) {
    if (!properties.id.trim()) {
      throw new ValidationError("Measurement id is required");
    }

    if (!properties.sensorId.trim()) {
      throw new ValidationError("Measurement sensor id is required");
    }

    if (!Number.isFinite(properties.value)) {
      throw new ValidationError("Measurement value must be a finite number");
    }

    if (Number.isNaN(properties.measuredAt.getTime())) {
      throw new ValidationError("Measurement date must be valid");
    }

    this.id = properties.id;
    this.sensorId = properties.sensorId;
    this.value = properties.value;
    this.measuredAt = new Date(properties.measuredAt);
  }
}
