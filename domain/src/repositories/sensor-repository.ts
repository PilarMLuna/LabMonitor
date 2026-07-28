import type { Sensor } from "../entities/sensor";

export interface SensorRepository {
  findById(id: string): Promise<Sensor | null>;
  findByExperimentId(experimentId: string): Promise<Sensor[]>;
  save(sensor: Sensor): Promise<void>;
}
