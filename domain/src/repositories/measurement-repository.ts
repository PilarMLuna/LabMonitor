import type { Measurement } from "../entities/measurement.js";

export interface MeasurementRepository {
  findById(id: string): Promise<Measurement | null>;
  save(measurement: Measurement): Promise<void>;
}
