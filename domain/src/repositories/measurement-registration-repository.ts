import type { Alert } from "../entities/alert.js";
import type { Measurement } from "../entities/measurement.js";

export interface MeasurementRegistrationRepository {
  saveMeasurementWithAlert(
    measurement: Measurement,
    alert: Alert | null,
  ): Promise<void>;
}
