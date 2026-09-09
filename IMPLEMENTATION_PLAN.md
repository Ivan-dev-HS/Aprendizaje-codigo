# CodeForge — Implementation Plan

Status: living document. Updated at the end of every phase with what shipped, what changed, and what's next.

## 1. Arquitectura

**Monolito modular** (sección 107): una API principal + un servicio de ejecución de código aislado, no microservicios innecesarios.

```
apps/
  web/            React + TypeScript + Vite + Tailwind — SPA
  api/            Node + TypeScript + Express — API principal (REST)
  exec-service/   Node + TypeScript + Express — ejecución aislada de JS/TS y SQL, interno, no expuesto públicamente
packages/
  database/       Prisma schema, client, migrations, seeds (fuente única de verdad del modelo de datos)
  types/          Tipos TypeScript compartidos (contratos API, DTOs)
  validators/       Esquemas Zod compartidos (usados en frontend para formularios y en backend para validar requests)
  ui/             Design system (componentes React reutilizables, sin lógica de negocio)
  config/         tsconfig, eslint, prettier compartidos
docs/             ARCHITECTURE.md, SECURITY.md, API.md, DATABASE.md, DEPLOYMENT.md
scripts/          scripts de mantenimiento (seed runner, health checks, etc.)
tests/            e2e (Playwright) a nivel de repo; unit/integration viven junto al código fuente
.github/workflows/ci.yml
docker-compose.yml
```

Gestor de monorepo: **pnpm workspaces** (ya disponible en el entorno, instalación determinista y rápida).

Capas (sección 5):

```
UI (React components)
  -> hooks (useXxx, TanStack Query)
    -> services (cliente API tipado, fetch wrapper con interceptores)
      -> API (Express routes)
        -> controllers (parseo/validación de request, respuesta HTTP)
          -> services (lógica de negocio, reglas de dominio: XP, mastery, adaptativo...)
            -> repositories (Prisma queries, únicas responsables de SQL/consultas)
              -> PostgreSQL
```

Ninguna capa salta a otra: los controllers nunca llaman a Prisma directamente, los componentes nunca hacen `fetch` directo.

## 2. Decisiones técnicas y justificación

| Decisión                                                                                                                                                                              | Alternativas consideradas                                 | Motivo                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm workspaces                                                                                                                                                                       | npm workspaces, Turborepo                                 | Instalación rápida, ya disponible, suficiente para el tamaño del proyecto sin añadir Turborepo todavía                                                                                                                           |
| Vite (no Next.js)                                                                                                                                                                     | Next.js                                                   | SPA educativa sin necesidad de SSR/SEO crítico salvo `/portfolio/:username` (se sirve con meta tags dinámicos vía endpoint SSR ligero más adelante si se requiere); Vite = build más simple para el alcance del monolito modular |
| Express (no Fastify)                                                                                                                                                                  | Fastify                                                   | Ecosistema de middlewares más amplio, equipo objetivo (juniors) más familiarizado                                                                                                                                                |
| bcryptjs                                                                                                                                                                              | bcrypt nativo, argon2                                     | Sin dependencias nativas (node-gyp) — evita fallos de compilación en entornos sin toolchain, buen equilibrio seguridad/portabilidad                                                                                              |
| JWT access (15 min) + refresh token rotado (7 días, httpOnly cookie)                                                                                                                  | Sesión solo-cookie con store en servidor                  | Stateless para el access token, revocable vía tabla `Session` para el refresh — persistente y seguro                                                                                                                             |
| Ejecución JS en `worker_threads` con límites de memoria/tiempo, sin `fs`/`net`/`child_process` expuestos                                                                              | vm2 (deprecado/inseguro), contenedor Docker por ejecución | Aislamiento suficiente para código JS de aprendizaje sin la complejidad operativa de orquestar contenedores por request; documentado como versión mínima seguray el path de evolución (sección 106)                              |
| SQL Lab contra PostgreSQL real, rol de BD dedicado de solo lectura sobre schema `sandbox`, transacción con `ROLLBACK` forzado + `statement_timeout` + guard de sentencia única SELECT | sql.js en navegador                                       | Permite ejercicios realistas con verificación exacta del motor real, con la misma seguridad que un rol de solo lectura + timeout                                                                                                 |
| Terminal Lab y Git Lab: simulación 100% en memoria (máquina de estados), sin invocar shell/git real                                                                                   | Ejecutar comandos reales en contenedor aislado            | Cero superficie de ataque real; el aprendizaje de los comandos no requiere un sistema real, solo un modelo fiel de su comportamiento                                                                                             |
| Contenido educativo en base de datos (seed), nunca hardcodeado en componentes                                                                                                         | Contenido en JSX/MDX                                      | Cumple sección 102 (CMS futuro, versionado, traducciones)                                                                                                                                                                        |

## 3. Alcance de contenido — decisión explícita

Sección 68 pide mínimos de cientos de ejercicios en 18 cursos completos, más docenas de casos de debugging/IT/networking y 100 preguntas de entrevista. Escribir esa cantidad de contenido pedagógico _de calidad real_ (sección 14/69: cada concepto con explicación simple + técnica + ejemplo + error típico + ejercicio + reto + aplicación práctica) para 18 cursos completos **y** construir toda la plataforma funcionando de extremo a extremo en una sola sesión de trabajo no es compatible con la regla fundamental de no generar contenido superficial de relleno.

**Decisión (autonomía, sección 114):** se prioriza que **toda la plataforma sea 100% funcional y no mockeada** (auth, progreso, ejercicios, labs, proyectos, empresa, entrevistas, admin) sobre alcanzar el volumen máximo de contenido en todas las áreas. Se autoría contenido profundo y real para un subconjunto insignia que ejercita cada tipo de ejercicio y cada laboratorio:

- Curso 1 Fundamentos de informática, Curso 2 HTML, Curso 3 CSS, Curso 4 JavaScript, Curso 5 Git — módulos, lecciones y ejercicios completos siguiendo el modelo pedagógico de 7 partes.
- Debugging Lab, IT Support, Networking, Producción — casos reales completos (SYMPTOMS/ENVIRONMENT/CODE/LOGS/EXPECTED/ACTUAL) en cantidad reducida pero íntegra.
- Empresa Nexora Tech — sprint completo con tickets reales, PR y code review simulados.
- Banco de preguntas de entrevista — cobertura real en las 6 categorías.

Los cursos restantes (TypeScript, React, Node, APIs, SQL, Testing, Linux, Docker, Proyecto Full Stack, Trabajo en empresa, Entrevistas como curso) existen como registros reales en base de datos (no páginas vacías) con descripción, al menos un módulo y una lección/ejercicio completos cada uno, y quedan documentados como backlog de contenido explícito en `docs/CONTENT_BACKLOG.md` — nunca presentados como completos cuando no lo están. Esta es una decisión de alcance, no una limitación oculta: se reporta expresamente al usuario.

## 4. Modelo de datos (resumen — ver `docs/DATABASE.md` para el detalle completo y `packages/database/prisma/schema.prisma` como fuente de verdad)

Entidades principales agrupadas por dominio:

- **Identidad**: `User`, `Profile`, `Session` (refresh tokens), `PasswordResetToken`, enum `Role { USER ADMIN }` (con comentario de extensión futura INSTRUCTOR/MENTOR/COMPANY vía tabla, no hardcode).
- **Aprendizaje**: `Course`, `Module`, `Lesson`, `Skill`, `UserSkill`, `LearningPath`, `LearningPathItem`.
- **Ejercicios**: `Exercise` (enum `ExerciseType` con los 12 tipos), `ExerciseAttempt`.
- **Labs**: `PlaygroundSnapshot` (HTML/CSS/JS guardado), `TerminalLabState`, `GitLabState`, `SqlLabDataset`.
- **Casos reales**: `Case` (enum `CaseDomain { DEBUGGING IT_SUPPORT NETWORKING PRODUCTION }`), `CaseAttempt`.
- **Proyectos**: `Project`, `ProjectTask`, `ProjectProgress`, `UserProject`.
- **Empresa**: `Ticket`, `TicketComment`, `Sprint`, `PullRequest`, `PRComment`, `CodeReview`, `StandupEntry`.
- **Entrevistas**: `InterviewQuestion`, `Interview` (plantilla), `InterviewAttempt`, `InterviewAnswer`.
- **Gamificación**: `Achievement`, `UserAchievement`, `Mission`, `UserMission`, `XpEvent`.
- **Portfolio/CV**: `Portfolio`, `Resume`.
- **Plataforma**: `Notification`, `ProgressEvent` (analytics), `AuditLog`, `FeatureFlag`.

Índices en toda FK de alto tráfico (`userId`, `courseId`, `skillId`, `exerciseId`, `ticket.status`, `projectId`) — sección 99.

## 5. API (resumen — ver `docs/API.md` y OpenAPI en `apps/api/openapi.yaml`)

Base: `/api/v1`. Autenticación por `Authorization: Bearer <accessToken>` + cookie httpOnly de refresh. Rutas admin bajo `/api/v1/admin/*`, protegidas por middleware de rol verificado en backend.

Grupos: `/auth`, `/users/me`, `/courses`, `/modules`, `/lessons`, `/exercises`, `/skills`, `/learning-paths`, `/labs/playground`, `/labs/js`, `/labs/sql`, `/labs/terminal`, `/labs/git`, `/cases`, `/projects`, `/portfolio`, `/resume`, `/tickets`, `/sprints`, `/pull-requests`, `/interviews`, `/gamification`, `/notifications`, `/search`, `/admin/*`, `/analytics` (admin), `/health`.

## 6. Seguridad (ver `docs/SECURITY.md`)

helmet, CORS con allowlist por env, rate limiting (general + estricto en `/auth`), bcryptjs, JWT corto + refresh rotado httpOnly+SameSite, validación Zod en cada input, autorización siempre verificada en backend (middleware `requireRole`), protección SQLi (Prisma parametrizado + guard adicional en SQL Lab), sanitización de output para XSS, cabecera CSRF custom + SameSite como mitigación, secrets solo por variables de entorno, AuditLog en mutaciones admin, sin stack traces en respuestas de producción, logging estructurado (pino) sin datos sensibles.

## 7. Ejecución de código (ver `docs/SECURITY.md` §Code Execution)

Ver decisión en tabla §2. `apps/exec-service` no se expone a internet (solo red interna docker-compose + token compartido), con límites de tiempo (timeout duro), memoria (`resourceLimits`), tamaño de output, y sin acceso a `fs`/`net`/`child_process`/`eval` de globals peligrosos fuera del worker sandbox.

## 8. Fases de implementación

Cada fase termina con: lint, typecheck, tests, build, verificación manual de la funcionalidad, actualización de documentación, commit.

- **Fase 0** — Este documento + `SPEC.md`. ✅
- **Fase 1** ✅ — Infraestructura: monorepo, tooling (ESLint/Prettier/Husky/lint-staged), Docker Compose (web/api/exec-service/postgres con healthchecks), Prisma init + migración inicial (incluye rol `codeforge_sandbox`), esqueleto de apps, CI, `/health`. Verificado end-to-end (migraciones, seed idempotente, los tres servicios arrancan y hablan entre sí).
- **Fase 2** ✅ — Auth: registro, login, logout, refresh (rotación de refresh token), recuperación de contraseña (`EmailProvider` mock que loguea el envío), perfil (`/users/me`), roles, rutas protegidas frontend (`ProtectedRoute`/`RequireOnboarding`/`RequireAdmin`) + backend (`requireAuth`/`requireRole`), onboarding completo (experiencia → objetivo → evaluación inicial de 8 preguntas reales → generación de `LearningPath` a partir de reglas por objetivo). Seed de 18 cursos, 24 skills y usuarios demo/admin. 17 tests de integración + 6 unit + E2E (Playwright: registro→onboarding→dashboard→logout→login, y bloqueo de ruta protegida) en verde.
- **Fase 3** ✅ — Motor educativo: `GET /courses`, `GET /courses/:slug` (con bloqueo de módulos: el primer módulo de un curso está desbloqueado, los siguientes requieren completar el anterior), `GET/POST /lessons/:id[/complete]` (otorga +10 XP idempotente y actualiza racha), `GET /skills[/me]`, `GET /learning-paths/me`. Servicio compartido de XP/nivel/racha (`gamification/xp.service.ts`) reutilizable desde la Fase 4 en adelante. Contenido real: 5 cursos insignia (Fundamentos, HTML, CSS, JavaScript, Git), 11 módulos, 29 lecciones con el modelo pedagógico de 6 partes de la sección 14. Frontend: catálogo/roadmap, detalle de curso con candados visuales, visor de lección con feedback de XP. 32 tests de integración/unit + 4 E2E (incluye completar una lección real y verificar que desbloquea el siguiente módulo, y que una lección de un módulo bloqueado da 403) en verde.
- **Fase 4** ✅ — Ejercicios: `GET /exercises` (filtrable por skill/dificultad/tipo, paginado), `GET /exercises/:id`, sistema de pistas progresivas (`GET /exercises/:id/hints/:level`, nunca expone la solución antes de tiempo), `POST /exercises/:id/attempt` con motor de corrección propio para MCQ/TRUE_FALSE/ORDERING/MATCHING/OUTPUT_PREDICTION/CODE_COMPLETION/DEBUGGING (los tipos que no requieren el exec-service). XP otorgado una sola vez por ejercicio (reutiliza `gamification/xp.service.ts`), penalización por pistas usadas, aprendizaje adaptativo real (3 fallos consecutivos marcan la skill como `isWeak`). 22 ejercicios reales sembrados. Se corrigió además un bug real de condición de carrera en `AuthProvider` (React StrictMode disparaba dos `POST /auth/refresh` simultáneos contra un refresh token de un solo uso, invalidando la sesión) — 12/12 ejecuciones E2E en verde tras el fix. 68 tests unit/integration + 6 E2E.
- **Fase 5** ✅ — Code labs: `apps/exec-service` real (antes solo esqueleto), aislado del proceso de la API — JavaScript en un `worker_thread` dedicado con contexto `vm` mínimo, `resourceLimits` de memoria y timeout duro (`ERR_SCRIPT_EXECUTION_TIMEOUT`); SQL contra el rol `codeforge_sandbox` (solo `SELECT` sobre el schema `sandbox`, transacción con `SET LOCAL statement_timeout` + `ROLLBACK` siempre, guard de texto adicional). `apps/api` expone `/labs/*` como proxy autenticado hacia el exec-service (nunca ejecuta código de usuario en su propio proceso) más CRUD de `PlaygroundSnapshot`. Terminal Lab y Git Lab son motores propios, deterministas y 100% en memoria (`terminal-engine.ts`: sistema de archivos virtual con `pwd/ls/cd/mkdir/touch/cat/echo/rm/cp/mv`; `git-engine.ts`: grafo de commits simulado con `init/add/commit/branch/checkout/merge/log`, estilo "Learn Git Branching" — sin invocar binarios reales), con estado persistido por usuario (`TerminalLabState`/`GitLabState`). Frontend: Monaco Editor self-hosted (sin CDN externo, workers bundleados por Vite, code-split en un chunk propio cargado solo al visitar un lab) para Playground (HTML/CSS/JS con preview en `<iframe sandbox="allow-scripts">` sin `allow-same-origin`), JS Lab y SQL Lab; Terminal Lab y Git Lab con UI de terminal interactiva. Dataset real sembrado para el SQL Lab ("tienda online": clientes + pedidos). 16 tests unit de los motores + 9 tests de integración reales (API → exec-service → Postgres real) + 5 E2E. CI actualizado para levantar exec-service y sembrar la base de datos antes de los tests de integración.
- **Fase 6** — Proyectos + Portfolio + CV builder.
- **Fase 7** — Simulador de empresa (Nexora Tech): tickets, sprints, PR, code review, standup + Debugging/IT Support/Networking/Producción.
- **Fase 8** — Entrevistas: banco de preguntas, simulación cronometrada, scoring.
- **Fase 9** — Gamificación + Dashboard + Notificaciones + Search global.
- **Fase 10** — Admin + Analytics + AuditLog + Feature flags.
- **Fase 11** — Endurecimiento: tests unit/integration/E2E ampliados, revisión de seguridad, accesibilidad, performance, documentación final, checklist sección 111.

## 9. Riesgos

- Volumen de contenido pedagógico de calidad es el mayor riesgo de tiempo → mitigado por la decisión de alcance §3, documentada y comunicada.
- Ejecución de código arbitrario es el mayor riesgo de seguridad → mitigado por diseño en §7, sin exponer el exec-service públicamente y sin ejecutar nunca código de usuario en el proceso de la API principal.
- Sin acceso a un proveedor de email real → recuperación de contraseña funcional a nivel de token/DB con un `EmailProvider` mock que loguea el envío (interfaz lista para un proveedor real).

## 10. Criterios de aceptación por fase

Cada fase se considera terminada cuando las funcionalidades que introduce son operables de extremo a extremo (backend real + UI real, sin mocks de las áreas prohibidas en sección 91), con lint/typecheck/tests/build en verde y sin regresiones en fases previas verificadas manualmente.
