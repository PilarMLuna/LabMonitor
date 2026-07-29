import { Alert, type AlertSeverity } from "../entities/alert.js";
import type { Measurement } from "../entities/measurement.js";
import type { Sensor } from "../entities/sensor.js";
import { buildOutOfRangeAlertMessage } from "./alert-message.js";
import type { Clock } from "./clock.js";
import type { IdGenerator } from "./id-generator.js";

export interface CreateOutOfRangeAlertInput {
  measurement: Measurement;
  sensor: Sensor;
  severity?: AlertSeverity;
}

export function createOutOfRangeAlert(
  input: CreateOutOfRangeAlertInput,
  idGenerator: IdGenerator,
  clock: Clock,
): Alert | null {
  if (!input.sensor.isValueOutOfRange(input.measurement.value)) {
    return null;
  }

  return new Alert({
    id: idGenerator.generate(),
    measurementId: input.measurement.id,
    sensorId: input.sensor.id,
    severity: input.severity ?? "medium",
    message: buildOutOfRangeAlertMessage(input.measurement, input.sensor),
    createdAt: clock.now(),
  });
}
