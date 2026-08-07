import { describe, expect, it } from "vitest";

import { Experiment, type ExperimentStatus } from "./experiment.js";

describe("Experiment", () => {
  it.each<ExperimentStatus>(["draft", "running", "paused", "finished"])(
    "supports the %s status",
    (status) => {
      const experiment = new Experiment({
        id: "experiment-1",
        name: "Plant growth",
        ownerId: "user-1",
      });

      experiment.changeStatus(status);

      expect(experiment.status).toBe(status);
    },
  );
});
