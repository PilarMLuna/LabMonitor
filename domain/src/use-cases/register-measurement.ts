import { Measurement } from "../entities/measurement.js";
import type { Alert } from "../entities/alert.js";
import { InvalidOperationError } from "../errors/invalid-operation-error.js";
import { NotFoundError } from "../errors/not-found-error.js";
import type { MeasurementRegistrationRepository } from "../repositories/measurement-registration-repository.js";
import type { SensorRepository } from "../repositories/sensor-repository.js";
import type { Clock } from "../services/clock.js";
import { createOutOfRangeAlert } from "../services/create-out-of-range-alert.js";
import type { IdGenerator } from "../services/id-generator.js";

export interface RegisterMeasurementInput {
  id: string;
  sensorId: string;
  value: number;
  measuredAt: Date;
}

export interface RegisterMeasurementResult {
  measurement: Measurement;
  alert: Alert | null;
}

export class RegisterMeasurement {
  constructor(
    private readonly sensors: SensorRepository,
    private readonly registrations: MeasurementRegistrationRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
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
    const alert = createOutOfRangeAlert(
      { measurement, sensor },
      this.idGenerator,
      this.clock,
    );
    await this.registrations.saveMeasurementWithAlert(measurement, alert);

    return { measurement, alert };
  }
}
