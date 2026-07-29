import type { Alert } from "../entities/alert.js";

export interface AlertRepository {
  findById(id: string): Promise<Alert | null>;
  findByMeasurementId(measurementId: string): Promise<Alert | null>;
  save(alert: Alert): Promise<void>;
}
