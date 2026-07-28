import { Measurement } from "../entities/measurement";
import type { Alert, AlertSeverity } from "../entities/alert";
import { InvalidOperationError } from "../errors/invalid-operation-error";
import { NotFoundError } from "../errors/not-found-error";
import type { MeasurementRepository } from "../repositories/measurement-repository";
import type { SensorRepository } from "../repositories/sensor-repository";
import type { GenerateAlertIfMeasurementOutOfRange } from "./generate-alert-if-measurement-out-of-range";

export interface RegisterMeasurementInput {
  id: string;
  alertId: string;
  sensorId: string;
  value: number;
  measuredAt: Date;
  alertSeverity?: AlertSeverity;
}

export interface RegisterMeasurementResult {
  measurement: Measurement;
  alert: Alert | null;
}

export class RegisterMeasurement {
  constructor(
    private readonly sensors: SensorRepository,
    private readonly measurements: MeasurementRepository,
    private readonly generateAlert: GenerateAlertIfMeasurementOutOfRange,
  ) {}

  async execute(
    input: RegisterMeasurementInput,
  ): Promise<RegisterMeasurementResult> {
    const sensor = await this.sensors.findById(input.sensorId);

    if (!sensor) {
      throw new NotFoundError("Sensor", input.sensorId);
    }

    if (sensor.status === "inactive") {
      throw new InvalidOperationError(
        "Cannot register a measurement for an inactive sensor",
      );
    }

    const measurement = new Measurement(input);
    await this.measurements.save(measurement);

    const alert = await this.generateAlert.execute({
      alertId: input.alertId,
      measurementId: measurement.id,
      ...(input.alertSeverity
        ? { severity: input.alertSeverity }
        : {}),
    });

    return { measurement, alert };
  }
}
