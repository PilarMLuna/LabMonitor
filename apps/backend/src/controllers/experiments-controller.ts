import { NotFoundError } from "@lab-monitor/domain";
import { Router } from "express";

import type { BackendDependencies } from "../dependencies.js";
import { asyncHandler } from "../http/async-handler.js";
import {
  presentExperiment,
  presentSensor,
} from "../http/presenters.js";
import {
  readBody,
  readNumber,
  readRouteParameter,
  readString,
} from "../http/request-validation.js";

export function createExperimentsController(
  dependencies: BackendDependencies,
): Router {
  const router = Router();

  router.post(
    "/",
    asyncHandler(async (request, response) => {
      const body = readBody(request.body);
      const experiment = await dependencies.useCases.createExperiment.execute({
        id: readString(body, "id"),
        name: readString(body, "name"),
        ownerId: readString(body, "ownerId"),
      });

      response.status(201).json(presentExperiment(experiment));
    }),
  );

  router.get(
    "/",
    asyncHandler(async (_request, response) => {
      const experiments = await dependencies.repositories.experiments.findAll();
      response.json(experiments.map(presentExperiment));
    }),
  );

  router.get(
    "/:experimentId",
    asyncHandler(async (request, response) => {
      const experimentId = readRouteParameter(
        request.params.experimentId,
        "experimentId",
      );
      const experiment = await dependencies.repositories.experiments.findById(
        experimentId,
      );

      if (!experiment) {
        throw new NotFoundError("Experiment", experimentId);
      }

      response.json(presentExperiment(experiment));
    }),
  );

  router.post(
    "/:experimentId/sensors",
    asyncHandler(async (request, response) => {
      const body = readBody(request.body);
      const experimentId = readRouteParameter(
        request.params.experimentId,
        "experimentId",
      );
      const sensor =
        await dependencies.useCases.addSensorToExperiment.execute({
          id: readString(body, "id"),
          experimentId,
          name: readString(body, "name"),
          minThreshold: readNumber(body, "minThreshold"),
          maxThreshold: readNumber(body, "maxThreshold"),
        });

      response.status(201).json(presentSensor(sensor));
    }),
  );

  router.get(
    "/:experimentId/sensors",
    asyncHandler(async (request, response) => {
      const experimentId = readRouteParameter(
        request.params.experimentId,
        "experimentId",
      );
      const experiment = await dependencies.repositories.experiments.findById(
        experimentId,
      );

      if (!experiment) {
        throw new NotFoundError("Experiment", experimentId);
      }

      const sensors = await dependencies.repositories.sensors.findByExperimentId(
        experiment.id,
      );
      response.json(sensors.map(presentSensor));
    }),
  );

  return router;
}
