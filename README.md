# CodeForge

Plataforma SaaS educativa para convertir a una persona que empieza desde cero en un
perfil preparado para incorporarse como desarrollador/a o técnico/a junior: cursos,
laboratorios de código, proyectos reales, simulación de empresa, entrevistas y
gamificación — todo funcional, sin mocks en las áreas centrales.

Ver `SPEC.md` (especificación original) e `IMPLEMENTATION_PLAN.md` (arquitectura,
decisiones y fases de implementación, actualizado continuamente).

## Quickstart

### Con Docker (recomendado)

```bash
cp .env.example .env
docker compose up --build
pnpm db:migrate:deploy   # primera vez
pnpm db:seed             # primera vez
```

- Web: http://localhost:5173
- API: http://localhost:4000/api/v1/health

### Sin Docker

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Ver `docs/DEPLOYMENT.md` para más detalle.

## Credenciales de demostración

Solo válidas en una instancia local de desarrollo, nunca credenciales reales. Se
crean con `pnpm db:seed` (ver `packages/database/prisma/seed/users.ts`):

| Rol   | Email               | Usuario | Contraseña     |
| ----- | ------------------- | ------- | -------------- |
| USER  | demo@example.local  | demo    | CodeForge2026! |
| ADMIN | admin@example.local | admin   | CodeForge2026! |

## Estructura del proyecto

```
apps/
  web/            React + TypeScript + Vite + Tailwind (SPA)
  api/            Node + TypeScript + Express — API principal
  exec-service/   Ejecución aislada de código (JS/SQL), no expuesto públicamente
packages/
  database/       Prisma schema, cliente, migraciones, seeds
  types/          Tipos compartidos
  validators/     Esquemas Zod compartidos
  ui/             Design system
  config/         tsconfig compartido
docs/             Arquitectura, seguridad, API, base de datos, despliegue, backlog de contenido
tests/e2e/        Tests end-to-end (Playwright)
```

## Scripts principales

| Comando                                                     | Descripción                                 |
| ----------------------------------------------------------- | ------------------------------------------- |
| `pnpm dev`                                                  | Levanta web, api y exec-service en paralelo |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` / `pnpm build` | Calidad, en todo el monorepo                |
| `pnpm db:migrate` / `pnpm db:seed` / `pnpm db:studio`       | Base de datos                               |
| `pnpm test:e2e`                                             | Playwright                                  |

## Estado de implementación

Este README y `IMPLEMENTATION_PLAN.md §8` se actualizan al cerrar cada fase. Estado
actual:

- [x] **Fase 0** — Especificación y plan de implementación.
- [x] **Fase 1** — Infraestructura: monorepo, tooling, Docker Compose, CI, `/health`.
- [x] **Fase 2** — Autenticación y onboarding.
- [ ] Fase 3 — Motor educativo y contenido insignia.
- [ ] Fase 4 — Motor de ejercicios.
- [ ] Fase 5 — Code labs.
- [ ] Fase 6 — Proyectos, portfolio y CV.
- [ ] Fase 7 — Simulador de empresa y casos reales.
- [ ] Fase 8 — Entrevistas.
- [ ] Fase 9 — Gamificación, dashboard, notificaciones, búsqueda.
- [ ] Fase 10 — Admin y analítica.
- [ ] Fase 11 — Endurecimiento final (checklist SPEC.md §111).

Ver `docs/CONTENT_BACKLOG.md` para el estado del contenido educativo por curso.

## Documentación

- `docs/ARCHITECTURE.md` — arquitectura y capas.
- `docs/SECURITY.md` — modelo de seguridad, incluida la ejecución aislada de código.
- `docs/DATABASE.md` — modelo de datos.
- `docs/API.md` — endpoints.
- `docs/DEPLOYMENT.md` — despliegue local y con Docker.
- `docs/CONTENT_BACKLOG.md` — cobertura real de contenido educativo.
- `CONTRIBUTING.md` — cómo contribuir.
