import { describe, expect, it } from "vitest";

import { ValidationError } from "../errors/validation-error.js";
import { Sensor } from "./sensor.js";

describe("Sensor", () => {
  it("allows a sensor to be activated and deactivated", () => {
    const sensor = new Sensor({
      id: "sensor-1",
      experimentId: "experiment-1",
      name: "Thermometer",
      minThreshold: 10,
      maxThreshold: 30,
    });

    expect(sensor.status).toBe("active");

    sensor.deactivate();
    expect(sensor.status).toBe("inactive");

    sensor.activate();
    expect(sensor.status).toBe("active");
  });

  it("rejects a sensor whose minimum threshold exceeds its maximum", () => {
    expect(
      () =>
        new Sensor({
          id: "sensor-1",
          experimentId: "experiment-1",
          name: "Thermometer",
          minThreshold: 31,
          maxThreshold: 30,
        }),
    ).toThrow(ValidationError);
  });
});
