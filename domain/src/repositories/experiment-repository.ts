import type { Experiment } from "../entities/experiment.js";

export interface ExperimentRepository {
  findById(id: string): Promise<Experiment | null>;
  save(experiment: Experiment): Promise<void>;
}
