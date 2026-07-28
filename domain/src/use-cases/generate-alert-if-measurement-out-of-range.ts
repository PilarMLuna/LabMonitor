import { Alert, type AlertSeverity } from "../entities/alert";
import { NotFoundError } from "../errors/not-found-error";
import type { AlertRepository } from "../repositories/alert-repository";
import type { MeasurementRepository } from "../repositories/measurement-repository";
import type { SensorRepository } from "../repositories/sensor-repository";
import { buildOutOfRangeAlertMessage } from "../services/alert-message";

export interface GenerateAlertInput {
  alertId: string;
  measurementId: string;
  severity?: AlertSeverity;
}

export class GenerateAlertIfMeasurementOutOfRange {
  constructor(
    private readonly measurements: MeasurementRepository,
    private readonly sensors: SensorRepository,
    private readonly alerts: AlertRepository,
  ) {}

  async execute(input: GenerateAlertInput): Promise<Alert | null> {
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

    const alert = new Alert({
      id: input.alertId,
      measurementId: measurement.id,
      sensorId: sensor.id,
      severity: input.severity ?? "medium",
      message: buildOutOfRangeAlertMessage(measurement, sensor),
      createdAt: measurement.measuredAt,
    });

    await this.alerts.save(alert);
    return alert;
  }
}
