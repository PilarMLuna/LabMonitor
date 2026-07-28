import { describe, expect, it } from "vitest";
import {
  GenerateAlertIfMeasurementOutOfRange,
  Measurement,
  Sensor,
} from "../src";
import {
  InMemoryAlertRepository,
  InMemoryMeasurementRepository,
  InMemorySensorRepository,
} from "./in-memory-repositories";

describe("GenerateAlertIfMeasurementOutOfRange", () => {
  it("generates an alert when the value is above the maximum threshold", async () => {
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
      value: 31,
      measuredAt: new Date("2026-01-01T10:00:00Z"),
    });
    await sensors.save(sensor);
    await measurements.save(measurement);

    const useCase = new GenerateAlertIfMeasurementOutOfRange(
      measurements,
      sensors,
      alerts,
    );
    const alert = await useCase.execute({
      alertId: "alert-1",
      measurementId: measurement.id,
      severity: "high",
    });

    expect(alert?.severity).toBe("high");
    expect(alert?.acknowledged).toBe(false);
    expect(alerts.items).toHaveLength(1);
  });

  it("does not generate an alert for a value at the threshold", async () => {
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
      value: 30,
      measuredAt: new Date("2026-01-01T10:00:00Z"),
    });
    await sensors.save(sensor);
    await measurements.save(measurement);

    const useCase = new GenerateAlertIfMeasurementOutOfRange(
      measurements,
      sensors,
      alerts,
    );

    expect(
      await useCase.execute({
        alertId: "alert-1",
        measurementId: measurement.id,
      }),
    ).toBeNull();
    expect(alerts.items).toHaveLength(0);
  });
});
