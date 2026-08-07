import type {
  Alert,
  AlertRepository,
  Experiment,
  ExperimentRepository,
  Measurement,
  MeasurementRegistrationRepository,
  MeasurementRepository,
  Sensor,
  SensorRepository,
} from "@lab-monitor/domain";

export class InMemoryExperimentRepository implements ExperimentRepository {
  private readonly items = new Map<string, Experiment>();

  async findById(id: string): Promise<Experiment | null> {
    return this.items.get(id) ?? null;
  }

  async findAll(): Promise<Experiment[]> {
    return [...this.items.values()];
  }

  async save(experiment: Experiment): Promise<void> {
    this.items.set(experiment.id, experiment);
  }
}

export class InMemorySensorRepository implements SensorRepository {
  private readonly items = new Map<string, Sensor>();

  async findById(id: string): Promise<Sensor | null> {
    return this.items.get(id) ?? null;
  }

  async findByExperimentId(experimentId: string): Promise<Sensor[]> {
    return [...this.items.values()].filter(
      (sensor) => sensor.experimentId === experimentId,
    );
  }

  async save(sensor: Sensor): Promise<void> {
    this.items.set(sensor.id, sensor);
  }
}

export class InMemoryMeasurementRepository
  implements MeasurementRepository
{
  private readonly items = new Map<string, Measurement>();

  async findById(id: string): Promise<Measurement | null> {
    return this.items.get(id) ?? null;
  }

  async findBySensorId(sensorId: string): Promise<Measurement[]> {
    return [...this.items.values()].filter(
      (measurement) => measurement.sensorId === sensorId,
    );
  }

  async save(measurement: Measurement): Promise<void> {
    this.items.set(measurement.id, measurement);
  }
}

export class InMemoryAlertRepository implements AlertRepository {
  private readonly items = new Map<string, Alert>();

  async findById(id: string): Promise<Alert | null> {
    return this.items.get(id) ?? null;
  }

  async findByMeasurementId(measurementId: string): Promise<Alert | null> {
    return (
      [...this.items.values()].find(
        (alert) => alert.measurementId === measurementId,
      ) ?? null
    );
  }

  async findAll(): Promise<Alert[]> {
    return [...this.items.values()];
  }

  async save(alert: Alert): Promise<void> {
    this.items.set(alert.id, alert);
  }
}

export class InMemoryMeasurementRegistrationRepository
  implements MeasurementRegistrationRepository
{
  constructor(
    private readonly measurements: MeasurementRepository,
    private readonly alerts: AlertRepository,
  ) {}

  async saveMeasurementWithAlert(
    measurement: Measurement,
    alert: Alert | null,
  ): Promise<void> {
    await this.measurements.save(measurement);

    if (alert) {
      await this.alerts.save(alert);
    }
  }
}
