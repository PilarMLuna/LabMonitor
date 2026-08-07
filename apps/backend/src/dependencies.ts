import {
  AcknowledgeAlert,
  AddSensorToExperiment,
  CreateExperiment,
  RegisterMeasurement,
  type Clock,
  type IdGenerator,
} from "@lab-monitor/domain";

import {
  InMemoryAlertRepository,
  InMemoryExperimentRepository,
  InMemoryMeasurementRegistrationRepository,
  InMemoryMeasurementRepository,
  InMemorySensorRepository,
} from "./repositories/in-memory-repositories.js";
import { RandomIdGenerator } from "./services/random-id-generator.js";
import { SystemClock } from "./services/system-clock.js";

export interface BackendDependencies {
  repositories: {
    alerts: InMemoryAlertRepository;
    experiments: InMemoryExperimentRepository;
    measurements: InMemoryMeasurementRepository;
    sensors: InMemorySensorRepository;
  };
  useCases: {
    acknowledgeAlert: AcknowledgeAlert;
    addSensorToExperiment: AddSensorToExperiment;
    createExperiment: CreateExperiment;
    registerMeasurement: RegisterMeasurement;
  };
  clock: Clock;
}

export interface BackendDependencyOptions {
  clock?: Clock;
  idGenerator?: IdGenerator;
}

export function createBackendDependencies(
  options: BackendDependencyOptions = {},
): BackendDependencies {
  const alerts = new InMemoryAlertRepository();
  const experiments = new InMemoryExperimentRepository();
  const measurements = new InMemoryMeasurementRepository();
  const sensors = new InMemorySensorRepository();
  const registrations = new InMemoryMeasurementRegistrationRepository(
    measurements,
    alerts,
  );
  const clock = options.clock ?? new SystemClock();
  const idGenerator = options.idGenerator ?? new RandomIdGenerator();

  return {
    repositories: { alerts, experiments, measurements, sensors },
    useCases: {
      acknowledgeAlert: new AcknowledgeAlert(alerts),
      addSensorToExperiment: new AddSensorToExperiment(experiments, sensors),
      createExperiment: new CreateExperiment(experiments),
      registerMeasurement: new RegisterMeasurement(
        sensors,
        registrations,
        idGenerator,
        clock,
      ),
    },
    clock,
  };
}
