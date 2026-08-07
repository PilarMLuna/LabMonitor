import { describe, expect, it } from "vitest";

import { ValidationError } from "../errors/validation-error.js";
import { Measurement } from "./measurement.js";

describe("Measurement", () => {
  it("keeps the required measurement data", () => {
    const measuredAt = new Date("2026-01-01T10:00:00Z");
    const measurement = new Measurement({
      id: "measurement-1",
      sensorId: "sensor-1",
      value: 25,
      measuredAt,
    });

    expect(measurement.sensorId).toBe("sensor-1");
    expect(measurement.value).toBe(25);
    expect(measurement.measuredAt).toEqual(measuredAt);
  });

  it.each([
    { value: Number.NaN, measuredAt: new Date() },
    { value: Number.POSITIVE_INFINITY, measuredAt: new Date() },
    { value: 25, measuredAt: new Date("invalid") },
  ])("rejects invalid measurement data", ({ value, measuredAt }) => {
    expect(
      () =>
        new Measurement({
          id: "measurement-1",
          sensorId: "sensor-1",
          value,
          measuredAt,
        }),
    ).toThrow(ValidationError);
  });
});
