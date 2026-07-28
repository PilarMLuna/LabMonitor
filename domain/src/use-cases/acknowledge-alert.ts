import type { Alert } from "../entities/alert";
import { NotFoundError } from "../errors/not-found-error";
import type { AlertRepository } from "../repositories/alert-repository";

export interface AcknowledgeAlertInput {
  alertId: string;
  acknowledgedAt: Date;
}

export class AcknowledgeAlert {
  constructor(private readonly alerts: AlertRepository) {}

  async execute(input: AcknowledgeAlertInput): Promise<Alert> {
    const alert = await this.alerts.findById(input.alertId);

    if (!alert) {
      throw new NotFoundError("Alert", input.alertId);
    }

    alert.acknowledge(input.acknowledgedAt);
    await this.alerts.save(alert);
    return alert;
  }
}
