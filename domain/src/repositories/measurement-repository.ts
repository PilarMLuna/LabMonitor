import type { Measurement } from "../entities/measurement";

export interface MeasurementRepository {
  findById(id: string): Promise<Measurement | null>;
  save(measurement: Measurement): Promise<void>;
}
