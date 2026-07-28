# LabMonitor

LabMonitor es una plataforma educativa para monitorear experimentos científicos.
Esta primera etapa contiene solamente el dominio y la configuración base del
monorepo.

## Arquitectura

El proyecto sigue la idea central de Clean Architecture: las reglas de negocio no
dependen de herramientas externas. El paquete `domain` contiene:

- `entities`: objetos principales y sus reglas básicas.
- `use-cases`: acciones que ofrece el sistema.
- `repositories`: contratos para guardar y buscar entidades.
- `services`: funciones de dominio que no pertenecen a una única entidad.
- `errors`: errores propios del dominio.

Las interfaces de repositorio viven en el dominio, pero sus implementaciones no.
Los tests usan implementaciones en memoria pequeñas ubicadas en `domain/test`.
Más adelante, una capa de infraestructura podrá implementar los mismos contratos
con una base de datos sin modificar estas reglas.

## Alcance actual

Incluye las entidades `User`, `Experiment`, `Sensor`, `Measurement` y `Alert`, y
los siguientes casos de uso:

1. `CreateExperiment`
2. `AddSensorToExperiment`
3. `RegisterMeasurement`
4. `GenerateAlertIfMeasurementOutOfRange`
5. `AcknowledgeAlert`

No incluye API HTTP, Express, frontend, ORM, base de datos ni Docker.

Los identificadores se reciben como datos de entrada. Esto evita acoplar el
dominio a una librería concreta para generar UUID. Como todavía no existe una
regla para calcular la severidad según la desviación, las alertas aceptan una
severidad explícita y usan `medium` por defecto.

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

Comprobar los tipos:

```bash
pnpm typecheck
```

Compilar el paquete de dominio:

```bash
pnpm build
```

## Flujo TDD

Para cada regla nueva:

1. escribir un test que describa el comportamiento;
2. comprobar que el test falla por la razón esperada;
3. implementar la solución mínima;
4. refactorizar manteniendo todos los tests en verde.
