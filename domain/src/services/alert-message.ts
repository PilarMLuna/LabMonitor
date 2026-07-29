import type { Measurement } from "../entities/measurement.js";
import type { Sensor } from "../entities/sensor.js";

export function buildOutOfRangeAlertMessage(
  measurement: Measurement,
  sensor: Sensor,
): string {
  return `Value ${measurement.value} is outside the allowed range ${sensor.minThreshold}-${sensor.maxThreshold}`;
}
