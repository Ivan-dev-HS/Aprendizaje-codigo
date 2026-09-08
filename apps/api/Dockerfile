# syntax=docker/dockerfile:1
#
# Nota de arquitectura: la API se ejecuta con `tsx` (compilación TS -> JS al
# vuelo vía esbuild) tanto en desarrollo como en producción, en lugar de
# precompilar a JS con tsc. Esto evita tener que empaquetar por separado los
# paquetes del workspace (@codeforge/database, etc.) y, sobre todo, evita los
# problemas conocidos de intentar empaquetar el cliente generado de Prisma
# (binarios nativos del query engine) con un bundler tipo esbuild/tsup. Es
# una decisión pragmática y explícita (ver IMPLEMENTATION_PLAN.md §2).
FROM node:22-alpine AS runtime
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages ./packages
COPY apps ./apps

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @codeforge/database run generate
RUN pnpm --filter @codeforge/api run typecheck

WORKDIR /repo/apps/api
ENV NODE_ENV=production
EXPOSE 4000
CMD ["pnpm", "start"]
