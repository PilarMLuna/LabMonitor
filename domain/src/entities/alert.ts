import { ValidationError } from "../errors/validation-error.js";

export type AlertSeverity = "low" | "medium" | "high";

export interface AlertProperties {
  id: string;
  measurementId: string;
  sensorId: string;
  severity: AlertSeverity;
  message: string;
  createdAt: Date;
  acknowledged?: boolean;
  acknowledgedAt?: Date;
}

export class Alert {
  readonly id: string;
  readonly measurementId: string;
  readonly sensorId: string;
  readonly severity: AlertSeverity;
  readonly message: string;
  readonly createdAt: Date;
  private isAcknowledged: boolean;
  private acknowledgmentDate: Date | undefined;

  constructor(properties: AlertProperties) {
    if (!properties.id.trim()) {
      throw new ValidationError("Alert id is required");
    }

    if (!properties.message.trim()) {
      throw new ValidationError("Alert message is required");
    }

    this.id = properties.id;
    this.measurementId = properties.measurementId;
    this.sensorId = properties.sensorId;
    this.severity = properties.severity;
    this.message = properties.message;
    this.createdAt = new Date(properties.createdAt);
    this.isAcknowledged = properties.acknowledged ?? false;
    this.acknowledgmentDate = properties.acknowledgedAt
      ? new Date(properties.acknowledgedAt)
      : undefined;
  }

  get acknowledged(): boolean {
    return this.isAcknowledged;
  }

  get acknowledgedAt(): Date | undefined {
    return this.acknowledgmentDate
      ? new Date(this.acknowledgmentDate)
      : undefined;
  }

  acknowledge(at: Date): void {
    if (this.isAcknowledged) {
      return;
    }

    this.isAcknowledged = true;
    this.acknowledgmentDate = new Date(at);
  }
}
