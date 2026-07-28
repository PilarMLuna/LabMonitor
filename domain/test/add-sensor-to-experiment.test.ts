import { describe, expect, it } from "vitest";
import {
  AddSensorToExperiment,
  Experiment,
  InvalidOperationError,
} from "../src";
import {
  InMemoryExperimentRepository,
  InMemorySensorRepository,
} from "./in-memory-repositories";

describe("AddSensorToExperiment", () => {
  it("adds an active sensor to an unfinished experiment", async () => {
    const experiments = new InMemoryExperimentRepository();
    const sensors = new InMemorySensorRepository();
    await experiments.save(
      new Experiment({
        id: "experiment-1",
        name: "Water temperature",
        ownerId: "user-1",
      }),
    );

    const useCase = new AddSensorToExperiment(experiments, sensors);
    const sensor = await useCase.execute({
      id: "sensor-1",
      experimentId: "experiment-1",
      name: "Thermometer",
      minThreshold: 10,
      maxThreshold: 30,
    });

    expect(sensor.status).toBe("active");
    expect(sensors.items).toContain(sensor);
  });

  it("rejects sensors for a finished experiment", async () => {
    const experiments = new InMemoryExperimentRepository();
    const sensors = new InMemorySensorRepository();
    const experiment = new Experiment({
      id: "experiment-1",
      name: "Finished study",
      ownerId: "user-1",
    });
    experiment.changeStatus("finished");
    await experiments.save(experiment);

    const useCase = new AddSensorToExperiment(experiments, sensors);

    await expect(
      useCase.execute({
        id: "sensor-1",
        experimentId: experiment.id,
        name: "Thermometer",
        minThreshold: 10,
        maxThreshold: 30,
      }),
    ).rejects.toBeInstanceOf(InvalidOperationError);
    expect(sensors.items).toHaveLength(0);
  });
});
