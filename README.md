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
- `services`: funciones de dominio y contratos pequeños, como reloj y generación
  de identificadores.
- `errors`: errores propios del dominio.

Las interfaces de repositorio viven en el dominio, pero sus implementaciones no.
Los archivos `*.test.ts` están colocalizados junto al código que prueban. Los
dobles de prueba compartidos, como los repositorios en memoria, se encuentran en
`domain/src/testing` y quedan excluidos del build. Más adelante, una capa de
infraestructura podrá implementar los mismos contratos con una base de datos sin
modificar estas reglas.

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

No incluye API HTTP, Express, frontend, ORM, base de datos ni Docker.

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
