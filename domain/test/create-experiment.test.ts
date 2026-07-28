import { describe, expect, it } from "vitest";
import { CreateExperiment } from "../src";
import { InMemoryExperimentRepository } from "./in-memory-repositories";

describe("CreateExperiment", () => {
  it("creates and saves an experiment in draft status", async () => {
    const experiments = new InMemoryExperimentRepository();
    const useCase = new CreateExperiment(experiments);

    const experiment = await useCase.execute({
      id: "experiment-1",
      name: "Plant growth",
      ownerId: "user-1",
    });

    expect(experiment.status).toBe("draft");
    expect(experiments.items).toContain(experiment);
  });
});
