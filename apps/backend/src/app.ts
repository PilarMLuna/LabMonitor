import express from "express";
import type { Express } from "express";

import { createAlertsController } from "./controllers/alerts-controller.js";
import { createExperimentsController } from "./controllers/experiments-controller.js";
import { createSensorsController } from "./controllers/sensors-controller.js";
import {
  createBackendDependencies,
  type BackendDependencies,
} from "./dependencies.js";
import { errorHandler } from "./http/error-handler.js";

export function createApp(
  dependencies: BackendDependencies = createBackendDependencies(),
): Express {
  const app = express();

  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/experiments", createExperimentsController(dependencies));
  app.use("/sensors", createSensorsController(dependencies));
  app.use("/alerts", createAlertsController(dependencies));

  app.use((_request, response) => {
    response.status(404).json({
      error: { code: "ROUTE_NOT_FOUND", message: "Route not found" },
    });
  });

  app.use(errorHandler);

  return app;
}
