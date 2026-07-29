import type { Sensor } from "../entities/sensor.js";

export interface SensorRepository {
  findById(id: string): Promise<Sensor | null>;
  findByExperimentId(experimentId: string): Promise<Sensor[]>;
  save(sensor: Sensor): Promise<void>;
}
