# LabMonitor

LabMonitor es una plataforma educativa para monitorear experimentos científicos.
Actualmente contiene el dominio y una API REST sencilla que mantiene sus datos
en memoria.

## Arquitectura

El proyecto sigue la idea central de Clean Architecture: las reglas de negocio no
dependen de herramientas externas. El paquete `domain` contiene:

- `entities`: objetos principales y sus reglas básicas.
- `use-cases`: acciones que ofrece el sistema.
- `repositories`: contratos para guardar y buscar entidades.
- `services`: funciones de dominio y contratos pequeños, como reloj y generación
  de identificadores.
- `errors`: errores propios del dominio.

Las interfaces de repositorio viven en el dominio, pero sus implementaciones no.
Los archivos `*.test.ts` están colocalizados junto al código que prueban. Los
dobles de prueba compartidos, como los repositorios en memoria, se encuentran en
`domain/src/testing` y quedan excluidos del build. Más adelante, una capa de
infraestructura podrá implementar los mismos contratos con una base de datos sin
modificar estas reglas.

La aplicación `apps/backend` es una capa externa construida con Express. Traduce
requests HTTP a llamadas de casos de uso, presenta sus resultados como JSON y
convierte errores conocidos en respuestas HTTP. Sus controllers no contienen
reglas de negocio. En esta fase, las implementaciones de repositorio viven en el
backend y almacenan los datos en memoria.

`RegisterMeasurement` decide si corresponde crear una alerta y entrega ambos
resultados a `MeasurementRegistrationRepository`. Ese contrato representa una
única operación de persistencia, para que una implementación futura pueda guardar
la medición y su alerta de forma atómica.

## Alcance actual

Incluye las entidades `User`, `Experiment`, `Sensor`, `Measurement` y `Alert`, y
los siguientes casos de uso:

1. `CreateExperiment`
2. `AddSensorToExperiment`
3. `RegisterMeasurement`
4. `GenerateAlertIfMeasurementOutOfRange`
5. `AcknowledgeAlert`

La API expone operaciones para crear y consultar experimentos, agregar y consultar
sensores, registrar y consultar mediciones, y consultar o reconocer alertas.

No incluye frontend, ORM, base de datos real ni Docker. Los datos se pierden cada
vez que se reinicia el backend.

Los identificadores de usuarios, experimentos, sensores y mediciones se reciben
como datos de entrada. Los identificadores de alertas se obtienen mediante el
contrato `IdGenerator`, sin acoplar el dominio a una librería concreta de UUID.
De la misma manera, `Clock` proporciona la fecha real de creación de cada alerta.

Como todavía no existe una regla para calcular la severidad según la desviación,
las alertas generadas durante el registro usan `medium`. El caso de uso específico
de generación también permite indicar `low`, `medium` o `high`.

## Requisitos

- Node.js 20 o superior
- pnpm 10

Si pnpm no está disponible, puede habilitarse con Corepack:

```bash
corepack enable
corepack prepare pnpm@10.14.0 --activate
```

## Comandos

Instalar dependencias:

```bash
pnpm install
```

Ejecutar los tests una vez:

```bash
pnpm test
```

Ejecutar los tests mientras se edita:

```bash
pnpm test:watch
```

Ejecutar solamente los tests del backend:

```bash
pnpm --filter @lab-monitor/backend test
```

Comprobar los tipos:

```bash
pnpm typecheck
```

Compilar todos los paquetes:

```bash
pnpm build
```

Iniciar la API en modo desarrollo:

```bash
pnpm dev:backend
```

Por defecto, la API queda disponible en `http://localhost:3000`. Se puede cambiar
el puerto con la variable de entorno `PORT`.

## API REST

Endpoints disponibles:

- `GET /health`
- `POST /experiments`
- `GET /experiments`
- `GET /experiments/:experimentId`
- `POST /experiments/:experimentId/sensors`
- `GET /experiments/:experimentId/sensors`
- `POST /sensors/:sensorId/measurements`
- `GET /sensors/:sensorId/measurements`
- `GET /alerts`
- `PATCH /alerts/:alertId/acknowledge`

Crear un experimento:

```bash
curl -X POST http://localhost:3000/experiments \
  -H "Content-Type: application/json" \
  -d '{"id":"experiment-1","name":"Cultivo de bacterias","ownerId":"user-1"}'
```

Agregar un sensor:

```bash
curl -X POST http://localhost:3000/experiments/experiment-1/sensors \
  -H "Content-Type: application/json" \
  -d '{"id":"sensor-1","name":"Temperatura","minThreshold":18,"maxThreshold":30}'
```

Registrar una medición fuera de rango, que genera una alerta:

```bash
curl -X POST http://localhost:3000/sensors/sensor-1/measurements \
  -H "Content-Type: application/json" \
  -d '{"id":"measurement-1","value":35,"measuredAt":"2026-08-07T15:00:00.000Z"}'
```

Consultar y reconocer alertas:

```bash
curl http://localhost:3000/alerts
curl -X PATCH http://localhost:3000/alerts/alert-id/acknowledge
```

## Flujo TDD

Para cada regla nueva:

1. escribir un test que describa el comportamiento;
2. comprobar que el test falla por la razón esperada;
3. implementar la solución mínima;
4. refactorizar manteniendo todos los tests en verde.
