import { NotFoundError } from "@lab-monitor/domain";
import { Router } from "express";

import type { BackendDependencies } from "../dependencies.js";
import { asyncHandler } from "../http/async-handler.js";
import {
  presentAlert,
  presentMeasurement,
} from "../http/presenters.js";
import {
  readBody,
  readDate,
  readNumber,
  readRouteParameter,
  readString,
} from "../http/request-validation.js";

export function createSensorsController(
  dependencies: BackendDependencies,
): Router {
  const router = Router();

  router.post(
    "/:sensorId/measurements",
    asyncHandler(async (request, response) => {
      const body = readBody(request.body);
      const sensorId = readRouteParameter(request.params.sensorId, "sensorId");
      const result = await dependencies.useCases.registerMeasurement.execute({
        id: readString(body, "id"),
        sensorId,
        value: readNumber(body, "value"),
        measuredAt: readDate(body, "measuredAt"),
      });

      response.status(201).json({
        measurement: presentMeasurement(result.measurement),
        alert: result.alert ? presentAlert(result.alert) : null,
      });
    }),
  );

  router.get(
    "/:sensorId/measurements",
    asyncHandler(async (request, response) => {
      const sensorId = readRouteParameter(request.params.sensorId, "sensorId");
      const sensor = await dependencies.repositories.sensors.findById(
        sensorId,
      );

      if (!sensor) {
        throw new NotFoundError("Sensor", sensorId);
      }

      const measurements =
        await dependencies.repositories.measurements.findBySensorId(sensor.id);
      response.json(measurements.map(presentMeasurement));
    }),
  );

  return router;
}
