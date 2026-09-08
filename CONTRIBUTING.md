# Contribuir a CodeForge

## Requisitos

- Node.js 22+
- pnpm (`corepack enable` para obtener la versión fijada en `package.json`)
- PostgreSQL 16 (local o vía `docker compose up postgres`)

## Flujo de trabajo

```bash
pnpm install        # instala dependencias de todo el monorepo y genera el cliente Prisma
cp .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Antes de cada commit, `husky` + `lint-staged` ejecutan ESLint/Prettier sobre los
archivos modificados. Antes de abrir una PR, ejecuta localmente:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## Estructura

Ver `docs/ARCHITECTURE.md`. Regla general: la lógica de negocio vive en `service.ts`
dentro de cada módulo de `apps/api/src/modules/<dominio>/`, nunca en el controller
ni en componentes de `apps/web`.

## Estilo de commits

Mensajes en imperativo y en español o inglés consistente con el resto del historial,
describiendo el porqué del cambio, no solo el qué.

## Contenido educativo

El contenido (cursos, lecciones, ejercicios, casos) vive en
`packages/database/prisma/seed/`, estructurado por dominio, nunca hardcodeado en
componentes de `apps/web` (sección 102 de SPEC.md). Antes de añadir contenido,
actualiza `docs/CONTENT_BACKLOG.md`.
