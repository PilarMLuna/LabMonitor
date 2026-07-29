import { Experiment } from "../entities/experiment.js";
import type { ExperimentRepository } from "../repositories/experiment-repository.js";

export interface CreateExperimentInput {
  id: string;
  name: string;
  ownerId: string;
}

export class CreateExperiment {
  constructor(private readonly experiments: ExperimentRepository) {}

  async execute(input: CreateExperimentInput): Promise<Experiment> {
    const experiment = new Experiment(input);
    await this.experiments.save(experiment);
    return experiment;
  }
}
