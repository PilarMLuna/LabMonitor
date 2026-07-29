import { describe, expect, it } from "vitest";
import { AcknowledgeAlert, Alert } from "../src/index.js";
import { InMemoryAlertRepository } from "./in-memory-repositories.js";

describe("AcknowledgeAlert", () => {
  it("marks an alert as acknowledged", async () => {
    const alerts = new InMemoryAlertRepository();
    const alert = new Alert({
      id: "alert-1",
      measurementId: "measurement-1",
      sensorId: "sensor-1",
      severity: "medium",
      message: "Value is outside the allowed range",
      createdAt: new Date("2026-01-01T10:00:00Z"),
    });
    await alerts.save(alert);
    const useCase = new AcknowledgeAlert(alerts);
    const acknowledgedAt = new Date("2026-01-01T11:00:00Z");

    const result = await useCase.execute({
      alertId: alert.id,
      acknowledgedAt,
    });

    expect(result.acknowledged).toBe(true);
    expect(result.acknowledgedAt).toEqual(acknowledgedAt);
  });
});
