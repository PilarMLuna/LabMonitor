import { describe, expect, it } from "vitest";

import { ValidationError } from "../errors/validation-error.js";
import { Alert, type AlertSeverity } from "./alert.js";

describe("Alert", () => {
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
    const alert = createAlert();

    expect(() => alert.acknowledge(new Date("invalid"))).toThrow(
      ValidationError,
    );
  });

  it("rejects an acknowledgment before its creation date", () => {
    const alert = createAlert();

    expect(() =>
      alert.acknowledge(new Date("2026-01-01T09:00:00Z")),
    ).toThrow(ValidationError);
  });

  it("protects its creation date from external mutation", () => {
    const alert = createAlert();

    const exposedDate = alert.createdAt;
    exposedDate.setUTCFullYear(2030);

    expect(alert.createdAt).toEqual(new Date("2026-01-01T10:00:00Z"));
  });
});

function createAlert(): Alert {
  return new Alert({
    id: "alert-1",
    measurementId: "measurement-1",
    sensorId: "sensor-1",
    severity: "medium",
    message: "Value is outside the allowed range",
    createdAt: new Date("2026-01-01T10:00:00Z"),
  });
}
