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
  private readonly creationDate: Date;
  private isAcknowledged: boolean;
  private acknowledgmentDate: Date | undefined;

  constructor(properties: AlertProperties) {
    if (!properties.id.trim()) {
      throw new ValidationError("Alert id is required");
    }

    if (!properties.message.trim()) {
      throw new ValidationError("Alert message is required");
    }

    if (!properties.measurementId.trim()) {
      throw new ValidationError("Alert measurement id is required");
    }

    if (!properties.sensorId.trim()) {
      throw new ValidationError("Alert sensor id is required");
    }

    if (Number.isNaN(properties.createdAt.getTime())) {
      throw new ValidationError("Alert creation date must be valid");
    }

    const acknowledged = properties.acknowledged ?? false;

    if (acknowledged && !properties.acknowledgedAt) {
      throw new ValidationError(
        "An acknowledged alert requires an acknowledgment date",
      );
    }

    if (!acknowledged && properties.acknowledgedAt) {
      throw new ValidationError(
        "An unacknowledged alert cannot have an acknowledgment date",
      );
    }

    if (
      properties.acknowledgedAt &&
      Number.isNaN(properties.acknowledgedAt.getTime())
    ) {
      throw new ValidationError("Alert acknowledgment date must be valid");
    }

    if (
      properties.acknowledgedAt &&
      properties.acknowledgedAt < properties.createdAt
    ) {
      throw new ValidationError(
        "Alert acknowledgment date cannot precede its creation date",
      );
    }

    this.id = properties.id;
    this.measurementId = properties.measurementId;
    this.sensorId = properties.sensorId;
    this.severity = properties.severity;
    this.message = properties.message;
    this.creationDate = new Date(properties.createdAt);
    this.isAcknowledged = acknowledged;
    this.acknowledgmentDate = properties.acknowledgedAt
      ? new Date(properties.acknowledgedAt)
      : undefined;
  }

  get acknowledged(): boolean {
    return this.isAcknowledged;
  }

  get createdAt(): Date {
    return new Date(this.creationDate);
  }

  get acknowledgedAt(): Date | undefined {
    return this.acknowledgmentDate
      ? new Date(this.acknowledgmentDate)
      : undefined;
  }

  acknowledge(at: Date): void {
    if (Number.isNaN(at.getTime())) {
      throw new ValidationError("Alert acknowledgment date must be valid");
    }

    if (at < this.creationDate) {
      throw new ValidationError(
        "Alert acknowledgment date cannot precede its creation date",
      );
    }

    if (this.isAcknowledged) {
      return;
    }

    this.isAcknowledged = true;
    this.acknowledgmentDate = new Date(at);
  }
}
