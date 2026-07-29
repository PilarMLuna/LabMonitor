import { describe, expect, it } from "vitest";
import {
  GenerateAlertIfMeasurementOutOfRange,
  InvalidOperationError,
  RegisterMeasurement,
  Sensor,
} from "../src/index.js";
import {
  InMemoryAlertRepository,
  InMemoryMeasurementRepository,
  InMemorySensorRepository,
} from "./in-memory-repositories.js";

function createUseCase() {
  const sensors = new InMemorySensorRepository();
  const measurements = new InMemoryMeasurementRepository();
  const alerts = new InMemoryAlertRepository();
  const generateAlert = new GenerateAlertIfMeasurementOutOfRange(
    measurements,
    sensors,
    alerts,
  );

  return {
    sensors,
    measurements,
    alerts,
    useCase: new RegisterMeasurement(
      sensors,
      measurements,
      generateAlert,
    ),
  };
}

describe("RegisterMeasurement", () => {
  it("registers an in-range measurement without generating an alert", async () => {
    const context = createUseCase();
    await context.sensors.save(
      new Sensor({
        id: "sensor-1",
        experimentId: "experiment-1",
        name: "pH sensor",
        minThreshold: 6,
        maxThreshold: 8,
      }),
    );

    const result = await context.useCase.execute({
      id: "measurement-1",
      alertId: "unused-alert-id",
      sensorId: "sensor-1",
      value: 7,
      measuredAt: new Date("2026-01-01T10:00:00Z"),
    });

    expect(context.measurements.items).toContain(result.measurement);
    expect(result.alert).toBeNull();
    expect(context.alerts.items).toHaveLength(0);
  });

  it("registers a measurement and generates an alert when needed", async () => {
    const context = createUseCase();
    await context.sensors.save(
      new Sensor({
        id: "sensor-1",
        experimentId: "experiment-1",
        name: "pH sensor",
        minThreshold: 6,
        maxThreshold: 8,
      }),
    );

    const result = await context.useCase.execute({
      id: "measurement-1",
      alertId: "alert-1",
      sensorId: "sensor-1",
      value: 9,
      measuredAt: new Date("2026-01-01T10:00:00Z"),
    });

    expect(context.measurements.items).toContain(result.measurement);
    expect(result.alert?.severity).toBe("medium");
    expect(context.alerts.items).toHaveLength(1);
  });

  it("rejects a measurement from an inactive sensor", async () => {
    const context = createUseCase();
    const sensor = new Sensor({
      id: "sensor-1",
      experimentId: "experiment-1",
      name: "pH sensor",
      minThreshold: 6,
      maxThreshold: 8,
    });
    sensor.deactivate();
    await context.sensors.save(sensor);

    await expect(
      context.useCase.execute({
        id: "measurement-1",
        alertId: "alert-1",
        sensorId: sensor.id,
        value: 7,
        measuredAt: new Date("2026-01-01T10:00:00Z"),
      }),
    ).rejects.toBeInstanceOf(InvalidOperationError);
    expect(context.measurements.items).toHaveLength(0);
  });
});
