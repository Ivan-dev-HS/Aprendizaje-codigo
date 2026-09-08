# Arquitectura

Ver también `IMPLEMENTATION_PLAN.md` (decisiones y fases) y `docs/DATABASE.md` / `docs/API.md` / `docs/SECURITY.md`.

## Visión general

CodeForge es un **monolito modular**: una API principal (`apps/api`) y un servicio de
ejecución de código aislado (`apps/exec-service`), no un enjambre de microservicios.
El frontend (`apps/web`) es una SPA en React que habla exclusivamente con `apps/api`
por HTTP/JSON — nunca accede a la base de datos ni al exec-service directamente.

```
apps/web  ──HTTP──▶  apps/api  ──HTTP interno──▶  apps/exec-service
                         │
                         ▼
                    PostgreSQL (Prisma)
```

`apps/exec-service` no se publica en el host (ver `docker-compose.yml`: no tiene
`ports`, solo `expose`) y exige un token compartido (`EXEC_SERVICE_INTERNAL_TOKEN`)
en cada request. Es el único proceso que ejecuta código de usuario (JS en
`worker_threads` aislados, SQL contra un rol de solo lectura), y vive separado del
proceso de la API principal para que un fallo o intento de escape ahí nunca
comprometa la autenticación, los datos de usuario ni el resto de la plataforma.

## Capas dentro de `apps/api`

```
routes (Express Router, un módulo por dominio bajo src/modules/<dominio>)
  -> controller (parsea/valida request con Zod, construye la respuesta HTTP)
    -> service (reglas de negocio: XP, mastery, anti-abuso, adaptativo...)
      -> repository (único lugar con querys de Prisma para ese dominio)
        -> @codeforge/database (Prisma Client)
```

Cada módulo de dominio (auth, courses, exercises, labs, cases, projects, company,
interviews, gamification, admin...) sigue esta misma estructura interna en
`apps/api/src/modules/<dominio>/`. Los controllers nunca importan Prisma
directamente; los tests de integración pueden sustituir el repository por un doble
sin tocar HTTP.

## Capas dentro de `apps/web`

```
pages/ (rutas) y features/<dominio>/components
  -> hooks/<dominio> (TanStack Query: useCoursesQuery, useSubmitExerciseMutation...)
    -> services/<dominio> (funciones que llaman a src/lib/api-client.ts, tipadas)
      -> apps/api
```

Ningún componente hace `fetch`/`axios` directo: siempre pasa por un hook de
`features/<dominio>` que usa TanStack Query, para tener loading/error/retry
consistentes en toda la app (sección 92/93 de SPEC.md).

## Paquetes compartidos

- `@codeforge/database`: única fuente de verdad del esquema (Prisma) y del cliente. Se
  usa sin compilar (TypeScript fuente): tanto `apps/api` como `apps/exec-service`
  ejecutan con `tsx`, que transpila sobre la marcha, evitando compilar por separado
  el cliente generado de Prisma (que incluye binarios nativos del query engine y es
  frágil de empaquetar con bundlers tipo esbuild/tsup).
- `@codeforge/types`: DTOs y contratos de API compartidos entre frontend y backend.
- `@codeforge/validators`: esquemas Zod compartidos — el backend los usa para validar
  requests y el frontend los reutiliza en formularios (React Hook Form +
  `@hookform/resolvers/zod`), evitando duplicar reglas de validación.
- `@codeforge/ui`: design system (componentes de presentación puros, sin llamadas a
  red ni lógica de negocio).
- `@codeforge/config`: `tsconfig.base.json` compartido.

## Por qué no Next.js / microservicios

Ver tabla de decisiones en `IMPLEMENTATION_PLAN.md §2`. Resumen: SPA con Vite es
suficiente para el alcance (no hay necesidad de SSR salvo el perfil público de
portfolio, que se resuelve con meta tags server-rendered de forma ligera si se
requiere más adelante); microservicios añadirían complejidad operativa sin beneficio
real al tamaño actual del producto (sección 107).
