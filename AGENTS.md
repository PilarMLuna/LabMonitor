# AGENTS.md

## Project goal

LabMonitor is an educational TypeScript monorepo for monitoring scientific
experiments. It is a final academy project focused on Clean Architecture, TDD,
backend APIs, frontend development and containerization in separate phases.

Keep the code simple and understandable for a student-level assignment. Work
only on the phase explicitly requested; do not implement future stages early.

## Clean Architecture

- Dependencies must point inward toward the domain.
- Domain code must not import Express, React, Prisma, Docker, database libraries
  or Node-specific infrastructure APIs.
- Business rules belong in entities, domain services or use cases.
- Repository interfaces belong in `domain`; implementations belong in testing
  or future infrastructure layers.
- `domain/src/testing` is test-only and must be excluded from production builds.
- Future controllers should stay thin, and the frontend should consume the API
  instead of duplicating domain rules.
- Avoid frameworks and abstractions that are not required by the current phase.

## TDD

- Prefer writing or updating tests before implementation.
- Confirm the expected failure before adding the minimum implementation.
- Cover success cases, relevant failures and business-rule boundaries.
- Test observable behavior, not implementation details.
- Keep tests readable, deterministic and specific.
- Do not remove or weaken tests only to make the suite pass.

## Testing rules

- Prefer colocated unit tests.
- Place test files as close as possible to the production file they test.
- Example:
  - `src/use-cases/create-experiment.ts`
  - `src/use-cases/create-experiment.test.ts`
- Use separate top-level test folders only for integration tests, e2e tests or
  shared setup that cannot be colocated clearly.
- Shared test helpers may live in `src/test-utils` or `src/testing`.
- Use `*.test.ts` naming so Vitest can discover tests.
- Production builds must use `tsconfig.build.json` and exclude test files and
  testing helpers.
- Do not move tests away from production code without explaining why.

## Domain rules

Main entities:

- `User`
- `Experiment`
- `Sensor`
- `Measurement`
- `Alert`

Current business rules:

- New experiments start in `draft`.
- Experiment states are `draft`, `running`, `paused` and `finished`.
- Sensors cannot be added to finished experiments.
- Sensors can be `active` or `inactive`.
- Measurements cannot be registered for inactive sensors.
- A measurement contains `sensorId`, `value` and `measuredAt`.
- Values below `minThreshold` or above `maxThreshold` generate an alert; values
  exactly at either threshold remain in range.
- Alert severities are `low`, `medium` and `high`.
- Alerts may be acknowledged and must keep valid, consistent dates.
- User roles are `admin`, `researcher`, `technician` and `viewer`.
- Do not invent transition, authorization or severity rules that are not defined.

## Stack

Current stack:

- TypeScript with strict checking and NodeNext modules
- pnpm workspaces
- Vitest
- Node.js 20 or newer

Planned stacks must be added only in their requested phase:

- Express for the backend API
- React, Vite and Storybook for the frontend
- PostgreSQL and Prisma for persistence
- Docker Compose for local orchestration

## Naming conventions

- Use English for code identifiers and filenames.
- Use kebab-case for filenames.
- Use PascalCase for classes, interfaces and types.
- Use camelCase for functions, methods and variables.
- Name use cases with clear actions, such as `CreateExperiment` and
  `RegisterMeasurement`.
- Use matching kebab-case filenames, such as `create-experiment.ts`.
- Use `*.test.ts` for tests.

## Git and PR rules

- Do not run `git commit` or `git push` unless explicitly requested.
- Preserve unrelated user changes and never stage them implicitly.
- Avoid `git add .`; suggest explicit paths or narrow path patterns.
- Suggest Conventional Commit messages.
- Do not claim unimplemented functionality in commits or PR descriptions.
- PR descriptions must include what changed, how to test, a checklist and known
  limitations.
- At the end of each implemented phase, provide:
  - modified files;
  - verification commands;
  - files to review manually;
  - explicit `git add` commands;
  - a suggested commit message;
  - whether opening or updating a PR is appropriate;
  - a copyable PR description in Markdown.

## Commands

Run workspace commands from the repository root:

- `pnpm install`
- `pnpm test`
- `pnpm test:watch`
- `pnpm typecheck`
- `pnpm build`

Use package-specific commands when needed:

- `pnpm --filter @lab-monitor/domain test`
- `pnpm --filter @lab-monitor/domain typecheck`
- `pnpm --filter @lab-monitor/domain build`

Do not document or require a lint command until the project defines one.

## Code style

- Prefer clarity over cleverness or overengineering.
- Keep classes and functions focused on one responsibility.
- Use explicit names and straightforward control flow.
- Avoid `any`, unnecessary abstractions and unused dependencies.
- Keep domain validation close to the rule it protects.
- Use `.js` extensions in relative TypeScript imports for NodeNext compatibility.
- Add comments only when they explain a non-obvious decision.
- Keep README documentation aligned with commands, structure and project scope.
