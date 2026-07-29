import { describe, expect, it } from "vitest";
import {
  Alert,
  Experiment,
  Measurement,
  Sensor,
  User,
  type AlertSeverity,
  type ExperimentStatus,
  type UserRole,
  ValidationError,
} from "../src/index.js";

describe("domain entities", () => {
  it.each<UserRole>(["admin", "researcher", "technician", "viewer"])(
    "creates a user with the %s role",
    (role) => {
      const user = new User({
        id: "user-1",
        name: "Ada",
        role,
      });

      expect(user.role).toBe(role);
    },
  );

  it.each<ExperimentStatus>(["draft", "running", "paused", "finished"])(
    "supports the %s experiment status",
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

  it("keeps the data required by a measurement", () => {
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

  it.each<AlertSeverity>(["low", "medium", "high"])(
    "creates an unacknowledged alert with %s severity",
    (severity) => {
      const alert = new Alert({
        id: "alert-1",
        measurementId: "measurement-1",
        sensorId: "sensor-1",
        severity,
        message: "Value is outside the allowed range",
        createdAt: new Date("2026-01-01T10:00:00Z"),
      });

      expect(alert.severity).toBe(severity);
      expect(alert.acknowledged).toBe(false);
    },
  );

  it.each([
    {
      measurementId: "",
      sensorId: "sensor-1",
      createdAt: new Date("2026-01-01T10:00:00Z"),
      acknowledged: false,
      acknowledgedAt: undefined,
    },
    {
      measurementId: "measurement-1",
      sensorId: "",
      createdAt: new Date("2026-01-01T10:00:00Z"),
      acknowledged: false,
      acknowledgedAt: undefined,
    },
    {
      measurementId: "measurement-1",
      sensorId: "sensor-1",
      createdAt: new Date("invalid"),
      acknowledged: false,
      acknowledgedAt: undefined,
    },
    {
      measurementId: "measurement-1",
      sensorId: "sensor-1",
      createdAt: new Date("2026-01-01T10:00:00Z"),
      acknowledged: true,
      acknowledgedAt: undefined,
    },
    {
      measurementId: "measurement-1",
      sensorId: "sensor-1",
      createdAt: new Date("2026-01-01T10:00:00Z"),
      acknowledged: false,
      acknowledgedAt: new Date("2026-01-01T11:00:00Z"),
    },
    {
      measurementId: "measurement-1",
      sensorId: "sensor-1",
      createdAt: new Date("2026-01-01T10:00:00Z"),
      acknowledged: true,
      acknowledgedAt: new Date("invalid"),
    },
    {
      measurementId: "measurement-1",
      sensorId: "sensor-1",
      createdAt: new Date("2026-01-01T10:00:00Z"),
      acknowledged: true,
      acknowledgedAt: new Date("2026-01-01T09:00:00Z"),
    },
  ])(
    "rejects inconsistent alert data",
    ({ measurementId, sensorId, createdAt, acknowledged, acknowledgedAt }) => {
      expect(
        () =>
          new Alert({
            id: "alert-1",
            measurementId,
            sensorId,
            severity: "medium",
            message: "Value is outside the allowed range",
            createdAt,
            acknowledged,
            ...(acknowledgedAt ? { acknowledgedAt } : {}),
          }),
      ).toThrow(ValidationError);
    },
  );

  it("rejects an invalid acknowledgment date", () => {
    const alert = new Alert({
      id: "alert-1",
      measurementId: "measurement-1",
      sensorId: "sensor-1",
      severity: "medium",
      message: "Value is outside the allowed range",
      createdAt: new Date("2026-01-01T10:00:00Z"),
    });

    expect(() => alert.acknowledge(new Date("invalid"))).toThrow(
      ValidationError,
    );
  });

  it("rejects an acknowledgment before the alert creation date", () => {
    const alert = new Alert({
      id: "alert-1",
      measurementId: "measurement-1",
      sensorId: "sensor-1",
      severity: "medium",
      message: "Value is outside the allowed range",
      createdAt: new Date("2026-01-01T10:00:00Z"),
    });

    expect(() =>
      alert.acknowledge(new Date("2026-01-01T09:00:00Z")),
    ).toThrow(ValidationError);
  });

  it("protects the alert creation date from external mutation", () => {
    const alert = new Alert({
      id: "alert-1",
      measurementId: "measurement-1",
      sensorId: "sensor-1",
      severity: "medium",
      message: "Value is outside the allowed range",
      createdAt: new Date("2026-01-01T10:00:00Z"),
    });

    const exposedDate = alert.createdAt;
    exposedDate.setUTCFullYear(2030);

    expect(alert.createdAt).toEqual(new Date("2026-01-01T10:00:00Z"));
  });
});
