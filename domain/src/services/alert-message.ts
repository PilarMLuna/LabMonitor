import type { Measurement } from "../entities/measurement";
import type { Sensor } from "../entities/sensor";

export function buildOutOfRangeAlertMessage(
  measurement: Measurement,
  sensor: Sensor,
): string {
  return `Value ${measurement.value} is outside the allowed range ${sensor.minThreshold}-${sensor.maxThreshold}`;
}
