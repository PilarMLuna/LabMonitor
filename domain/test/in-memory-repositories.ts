import type {
  Alert,
  AlertRepository,
  Clock,
  Experiment,
  ExperimentRepository,
  IdGenerator,
  Measurement,
  MeasurementRegistrationRepository,
  MeasurementRepository,
  Sensor,
  SensorRepository,
} from "../src/index.js";

export class InMemoryExperimentRepository implements ExperimentRepository {
  readonly items: Experiment[] = [];

  async findById(id: string): Promise<Experiment | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async save(experiment: Experiment): Promise<void> {
    const index = this.items.findIndex((item) => item.id === experiment.id);
    if (index >= 0) {
      this.items[index] = experiment;
      return;
    }
    this.items.push(experiment);
  }
}

export class InMemorySensorRepository implements SensorRepository {
  readonly items: Sensor[] = [];

  async findById(id: string): Promise<Sensor | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByExperimentId(experimentId: string): Promise<Sensor[]> {
    return this.items.filter((item) => item.experimentId === experimentId);
  }

  async save(sensor: Sensor): Promise<void> {
    const index = this.items.findIndex((item) => item.id === sensor.id);
    if (index >= 0) {
      this.items[index] = sensor;
      return;
    }
    this.items.push(sensor);
  }
}

export class InMemoryMeasurementRepository implements MeasurementRepository {
  readonly items: Measurement[] = [];

  async findById(id: string): Promise<Measurement | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async save(measurement: Measurement): Promise<void> {
    const index = this.items.findIndex((item) => item.id === measurement.id);
    if (index >= 0) {
      this.items[index] = measurement;
      return;
    }
    this.items.push(measurement);
  }
}

export class InMemoryAlertRepository implements AlertRepository {
  readonly items: Alert[] = [];

  async findById(id: string): Promise<Alert | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async findByMeasurementId(measurementId: string): Promise<Alert | null> {
    return (
      this.items.find((item) => item.measurementId === measurementId) ?? null
    );
  }

  async save(alert: Alert): Promise<void> {
    const index = this.items.findIndex((item) => item.id === alert.id);
    if (index >= 0) {
      this.items[index] = alert;
      return;
    }
    this.items.push(alert);
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

export class FixedIdGenerator implements IdGenerator {
  constructor(private readonly id: string) {}

  generate(): string {
    return this.id;
  }
}

export class FixedClock implements Clock {
  constructor(private readonly currentDate: Date) {}

  now(): Date {
    return new Date(this.currentDate);
  }
}
