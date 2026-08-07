import { Router } from "express";

import type { BackendDependencies } from "../dependencies.js";
import { asyncHandler } from "../http/async-handler.js";
import { presentAlert } from "../http/presenters.js";
import { readRouteParameter } from "../http/request-validation.js";

export function createAlertsController(
  dependencies: BackendDependencies,
): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_request, response) => {
      const alerts = await dependencies.repositories.alerts.findAll();
      response.json(alerts.map(presentAlert));
    }),
  );

  router.patch(
    "/:alertId/acknowledge",
    asyncHandler(async (request, response) => {
      const alertId = readRouteParameter(request.params.alertId, "alertId");
      const alert = await dependencies.useCases.acknowledgeAlert.execute({
        alertId,
        acknowledgedAt: dependencies.clock.now(),
      });

      response.json(presentAlert(alert));
    }),
  );

  return router;
}
