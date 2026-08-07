import type { Clock, IdGenerator } from "@lab-monitor/domain";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "./app.js";
import { createBackendDependencies } from "./dependencies.js";

const fixedDate = new Date("2026-01-01T10:05:00Z");

describe("LabMonitor API", () => {
  it("reports its health", async () => {
    const response = await request(createTestApp()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("creates, lists and finds experiments", async () => {
    const app = createTestApp();
    const experiment = {
      id: "experiment-1",
      name: "Plant growth",
      ownerId: "user-1",
    };

    const created = await request(app).post("/experiments").send(experiment);
    const listed = await request(app).get("/experiments");
    const found = await request(app).get("/experiments/experiment-1");
    const missing = await request(app).get("/experiments/missing-experiment");

    expect(created.status).toBe(201);
    expect(created.body).toEqual({ ...experiment, status: "draft" });
    expect(listed.body).toEqual([{ ...experiment, status: "draft" }]);
    expect(found.body).toEqual({ ...experiment, status: "draft" });
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe("NOT_FOUND");
  });

  it("adds and lists sensors for an experiment", async () => {
    const app = createTestApp();
    await createExperiment(app);

    const sensor = {
      id: "sensor-1",
      name: "Thermometer",
      minThreshold: 10,
      maxThreshold: 30,
    };
    const created = await request(app)
      .post("/experiments/experiment-1/sensors")
      .send(sensor);
    const listed = await request(app).get(
      "/experiments/experiment-1/sensors",
    );

    expect(created.status).toBe(201);
    expect(created.body).toEqual({
      ...sensor,
      experimentId: "experiment-1",
      status: "active",
    });
    expect(listed.body).toEqual([created.body]);
  });

  it("registers measurements, generates alerts and acknowledges them", async () => {
    const app = createTestApp();
    await createExperiment(app);
    await createSensor(app);

    const inRange = await request(app)
      .post("/sensors/sensor-1/measurements")
      .send({
        id: "measurement-1",
        value: 20,
        measuredAt: "2026-01-01T10:00:00Z",
      });
    const outOfRange = await request(app)
      .post("/sensors/sensor-1/measurements")
      .send({
        id: "measurement-2",
        value: 31,
        measuredAt: "2026-01-01T10:01:00Z",
      });
    const measurements = await request(app).get(
      "/sensors/sensor-1/measurements",
    );
    const alerts = await request(app).get("/alerts");
    const acknowledged = await request(app).patch(
      "/alerts/alert-1/acknowledge",
    );

    expect(inRange.status).toBe(201);
    expect(inRange.body.alert).toBeNull();
    expect(outOfRange.status).toBe(201);
    expect(outOfRange.body.alert).toMatchObject({
      id: "alert-1",
      measurementId: "measurement-2",
      sensorId: "sensor-1",
      severity: "medium",
      acknowledged: false,
    });
    expect(measurements.body).toHaveLength(2);
    expect(alerts.body).toHaveLength(1);
    expect(acknowledged.status).toBe(200);
    expect(acknowledged.body).toMatchObject({
      id: "alert-1",
      acknowledged: true,
      acknowledgedAt: fixedDate.toISOString(),
    });
  });

  it("returns basic validation and not-found errors", async () => {
    const app = createTestApp();

    const invalidExperiment = await request(app)
      .post("/experiments")
      .send({ name: "Missing fields" });
    const missingExperiment = await request(app)
      .post("/experiments/missing-experiment/sensors")
      .send({
        id: "sensor-1",
        name: "Thermometer",
        minThreshold: 10,
        maxThreshold: 30,
      });
    const missingSensor = await request(app)
      .post("/sensors/missing-sensor/measurements")
      .send({
        id: "measurement-1",
        value: 20,
        measuredAt: "2026-01-01T10:00:00Z",
      });
    const unknownRoute = await request(app).get("/unknown");

    expect(invalidExperiment.status).toBe(400);
    expect(invalidExperiment.body.error.code).toBe("INVALID_REQUEST");
    expect(missingExperiment.status).toBe(404);
    expect(missingSensor.status).toBe(404);
    expect(unknownRoute.status).toBe(404);
    expect(unknownRoute.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});

function createTestApp() {
  return createApp(
    createBackendDependencies({
      clock: new FixedClock(fixedDate),
      idGenerator: new FixedIdGenerator("alert-1"),
    }),
  );
}

async function createExperiment(app: ReturnType<typeof createApp>) {
  await request(app).post("/experiments").send({
    id: "experiment-1",
    name: "Plant growth",
    ownerId: "user-1",
  });
}

async function createSensor(app: ReturnType<typeof createApp>) {
  await request(app).post("/experiments/experiment-1/sensors").send({
    id: "sensor-1",
    name: "Thermometer",
    minThreshold: 10,
    maxThreshold: 30,
  });
}

class FixedClock implements Clock {
  constructor(private readonly date: Date) {}

  now(): Date {
    return new Date(this.date);
  }
}

class FixedIdGenerator implements IdGenerator {
  constructor(private readonly id: string) {}

  generate(): string {
    return this.id;
  }
}
