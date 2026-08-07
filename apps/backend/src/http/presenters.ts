import type {
  Alert,
  Experiment,
  Measurement,
  Sensor,
} from "@lab-monitor/domain";

export function presentExperiment(experiment: Experiment) {
  return {
    id: experiment.id,
    name: experiment.name,
    ownerId: experiment.ownerId,
    status: experiment.status,
  };
}

export function presentSensor(sensor: Sensor) {
  return {
    id: sensor.id,
    experimentId: sensor.experimentId,
    name: sensor.name,
    minThreshold: sensor.minThreshold,
    maxThreshold: sensor.maxThreshold,
    status: sensor.status,
  };
}

export function presentMeasurement(measurement: Measurement) {
  return {
    id: measurement.id,
    sensorId: measurement.sensorId,
    value: measurement.value,
    measuredAt: measurement.measuredAt.toISOString(),
  };
}

export function presentAlert(alert: Alert) {
  return {
    id: alert.id,
    measurementId: alert.measurementId,
    sensorId: alert.sensorId,
    severity: alert.severity,
    message: alert.message,
    createdAt: alert.createdAt.toISOString(),
    acknowledged: alert.acknowledged,
    acknowledgedAt: alert.acknowledgedAt?.toISOString() ?? null,
  };
}
