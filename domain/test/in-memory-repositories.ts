import type {
  Alert,
  AlertRepository,
  Experiment,
  ExperimentRepository,
  Measurement,
  MeasurementRepository,
  Sensor,
  SensorRepository,
} from "../src";

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
