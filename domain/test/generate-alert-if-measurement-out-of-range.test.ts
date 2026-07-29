import { describe, expect, it } from "vitest";
import {
  GenerateAlertIfMeasurementOutOfRange,
  Measurement,
  Sensor,
} from "../src/index.js";
import {
  InMemoryAlertRepository,
  InMemoryMeasurementRepository,
  InMemorySensorRepository,
} from "./in-memory-repositories.js";

async function createUseCaseWithMeasurement(value: number) {
  const sensors = new InMemorySensorRepository();
  const measurements = new InMemoryMeasurementRepository();
  const alerts = new InMemoryAlertRepository();
  const sensor = new Sensor({
    id: "sensor-1",
    experimentId: "experiment-1",
    name: "Thermometer",
    minThreshold: 10,
    maxThreshold: 30,
  });
  const measurement = new Measurement({
    id: "measurement-1",
    sensorId: sensor.id,
    value,
    measuredAt: new Date("2026-01-01T10:00:00Z"),
  });
  await sensors.save(sensor);
  await measurements.save(measurement);

  return {
    alerts,
    measurement,
    useCase: new GenerateAlertIfMeasurementOutOfRange(
      measurements,
      sensors,
      alerts,
    ),
  };
}

describe("GenerateAlertIfMeasurementOutOfRange", () => {
  it("generates an alert when the value is above the maximum threshold", async () => {
    const context = await createUseCaseWithMeasurement(31);
    const alert = await context.useCase.execute({
      alertId: "alert-1",
      measurementId: context.measurement.id,
      severity: "high",
    });

    expect(alert?.severity).toBe("high");
    expect(alert?.acknowledged).toBe(false);
    expect(context.alerts.items).toHaveLength(1);
  });

  it("generates an alert when the value is below the minimum threshold", async () => {
    const context = await createUseCaseWithMeasurement(9);
    const alert = await context.useCase.execute({
      alertId: "alert-1",
      measurementId: context.measurement.id,
      severity: "low",
    });

    expect(alert?.severity).toBe("low");
    expect(context.alerts.items).toHaveLength(1);
  });

  it.each([10, 20, 30])(
    "does not generate an alert for the in-range value %s",
    async (value) => {
      const context = await createUseCaseWithMeasurement(value);

      expect(
        await context.useCase.execute({
          alertId: "alert-1",
          measurementId: context.measurement.id,
        }),
      ).toBeNull();
      expect(context.alerts.items).toHaveLength(0);
    },
  );

  it("does not create a second alert for the same measurement", async () => {
    const context = await createUseCaseWithMeasurement(31);
    const firstAlert = await context.useCase.execute({
      alertId: "alert-1",
      measurementId: context.measurement.id,
    });
    const secondAlert = await context.useCase.execute({
      alertId: "alert-2",
      measurementId: context.measurement.id,
    });

    expect(secondAlert).toBe(firstAlert);
    expect(context.alerts.items).toHaveLength(1);
  });
});
