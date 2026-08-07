import { describe, expect, it } from "vitest";
import {
  InvalidOperationError,
  NotFoundError,
  RegisterMeasurement,
  Sensor,
} from "../index.js";
import {
  FixedClock,
  FixedIdGenerator,
  InMemoryAlertRepository,
  InMemoryMeasurementRegistrationRepository,
  InMemoryMeasurementRepository,
  InMemorySensorRepository,
} from "../testing/in-memory-repositories.js";

function createUseCase() {
  const sensors = new InMemorySensorRepository();
  const measurements = new InMemoryMeasurementRepository();
  const alerts = new InMemoryAlertRepository();
  const registrations = new InMemoryMeasurementRegistrationRepository(
    measurements,
    alerts,
  );
  const clock = new FixedClock(new Date("2026-01-01T10:05:00Z"));

  return {
    sensors,
    measurements,
    alerts,
    clock,
    useCase: new RegisterMeasurement(
      sensors,
      registrations,
      new FixedIdGenerator("alert-1"),
      clock,
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
      sensorId: "sensor-1",
      value: 9,
      measuredAt: new Date("2026-01-01T10:00:00Z"),
    });

    expect(context.measurements.items).toContain(result.measurement);
    expect(result.alert?.id).toBe("alert-1");
    expect(result.alert?.severity).toBe("medium");
    expect(result.alert?.createdAt).toEqual(context.clock.now());
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
        sensorId: sensor.id,
        value: 7,
        measuredAt: new Date("2026-01-01T10:00:00Z"),
      }),
    ).rejects.toBeInstanceOf(InvalidOperationError);
    expect(context.measurements.items).toHaveLength(0);
  });

  it("rejects a measurement when the sensor does not exist", async () => {
    const context = createUseCase();

    await expect(
      context.useCase.execute({
        id: "measurement-1",
        sensorId: "missing-sensor",
        value: 7,
        measuredAt: new Date("2026-01-01T10:00:00Z"),
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(context.measurements.items).toHaveLength(0);
    expect(context.alerts.items).toHaveLength(0);
  });
});
