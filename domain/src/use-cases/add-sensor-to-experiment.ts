import { Sensor } from "../entities/sensor";
import { InvalidOperationError } from "../errors/invalid-operation-error";
import { NotFoundError } from "../errors/not-found-error";
import type { ExperimentRepository } from "../repositories/experiment-repository";
import type { SensorRepository } from "../repositories/sensor-repository";

export interface AddSensorToExperimentInput {
  id: string;
  experimentId: string;
  name: string;
  minThreshold: number;
  maxThreshold: number;
}

export class AddSensorToExperiment {
  constructor(
    private readonly experiments: ExperimentRepository,
    private readonly sensors: SensorRepository,
  ) {}

  async execute(input: AddSensorToExperimentInput): Promise<Sensor> {
    const experiment = await this.experiments.findById(input.experimentId);

    if (!experiment) {
      throw new NotFoundError("Experiment", input.experimentId);
    }

    if (experiment.status === "finished") {
      throw new InvalidOperationError(
        "Cannot add a sensor to a finished experiment",
      );
    }

    const sensor = new Sensor(input);
    await this.sensors.save(sensor);
    return sensor;
  }
}
