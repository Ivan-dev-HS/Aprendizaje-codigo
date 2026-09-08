# syntax=docker/dockerfile:1
# Ver nota de arquitectura en apps/api/Dockerfile sobre el uso de `tsx` como runtime.
FROM node:22-alpine AS runtime
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages ./packages
COPY apps ./apps

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @codeforge/exec-service run typecheck

WORKDIR /repo/apps/exec-service
ENV NODE_ENV=production
EXPOSE 4100
CMD ["pnpm", "start"]
