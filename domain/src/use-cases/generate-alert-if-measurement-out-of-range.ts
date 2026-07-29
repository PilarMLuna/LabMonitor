import type { Alert, AlertSeverity } from "../entities/alert.js";
import { NotFoundError } from "../errors/not-found-error.js";
import type { AlertRepository } from "../repositories/alert-repository.js";
import type { MeasurementRepository } from "../repositories/measurement-repository.js";
import type { SensorRepository } from "../repositories/sensor-repository.js";
import { createOutOfRangeAlert } from "../services/create-out-of-range-alert.js";
import type { Clock } from "../services/clock.js";
import type { IdGenerator } from "../services/id-generator.js";

export interface GenerateAlertIfMeasurementOutOfRangeInput {
  measurementId: string;
  severity?: AlertSeverity;
}

export class GenerateAlertIfMeasurementOutOfRange {
  constructor(
    private readonly measurements: MeasurementRepository,
    private readonly sensors: SensorRepository,
    private readonly alerts: AlertRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(
    input: GenerateAlertIfMeasurementOutOfRangeInput,
  ): Promise<Alert | null> {
    const measurement = await this.measurements.findById(input.measurementId);

    if (!measurement) {
      throw new NotFoundError("Measurement", input.measurementId);
    }

    const sensor = await this.sensors.findById(measurement.sensorId);

    if (!sensor) {
      throw new NotFoundError("Sensor", measurement.sensorId);
    }

    if (!sensor.isValueOutOfRange(measurement.value)) {
      return null;
    }

    const existingAlert = await this.alerts.findByMeasurementId(measurement.id);
    if (existingAlert) {
      return existingAlert;
    }

    const alert = createOutOfRangeAlert(
      {
        measurement,
        sensor,
        ...(input.severity ? { severity: input.severity } : {}),
      },
      this.idGenerator,
      this.clock,
    );

    if (!alert) {
      return null;
    }

    await this.alerts.save(alert);
    return alert;
  }
}
