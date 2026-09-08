# Despliegue

## Local con Docker Compose (recomendado para probar el stack completo)

```bash
cp .env.example .env   # ajusta secretos si quieres, los valores por defecto funcionan en local
docker compose up --build
```

Servicios: `postgres` (5432), `exec-service` (interno, sin puerto publicado),
`api` (4000), `web` (5173, servido por nginx). Tras el primer arranque, aplica
migraciones y siembra datos desde el host (o desde dentro del contenedor `api`):

```bash
pnpm db:migrate:deploy
pnpm db:seed
```

## Local sin Docker (bucle de desarrollo)

Requiere Node 22+, pnpm y una instancia de PostgreSQL accesible.

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev   # levanta web (5173), api (4000) y exec-service (4100) en paralelo
```

## Variables de entorno

Ver `.env.example`, documentado variable por variable. Nunca commitear un `.env`
con secretos reales; en producción, generar `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET` y `EXEC_SERVICE_INTERNAL_TOKEN` con `openssl rand -hex 32`.

## Notas de la imagen Docker

Por diseño (ver `IMPLEMENTATION_PLAN.md §2` y la nota en `apps/api/Dockerfile`),
las imágenes de `api` y `exec-service` no precompilan a un bundle: instalan el
monorepo completo y ejecutan con `tsx`. Esto simplifica el pipeline y evita
problemas conocidos de empaquetar el cliente generado de Prisma con bundlers, a
costa de una imagen más grande de lo estrictamente necesario. Optimización futura
documentada: mover a una build multi-stage con `pnpm deploy --prod` una vez el
equipo decida invertir en ello (no es necesario para el tamaño actual del
producto).

## Salud y observabilidad

`GET /api/v1/health` comprueba conectividad con PostgreSQL y se usa como
`HEALTHCHECK` en `docker-compose.yml`. Logging estructurado con `pino` (ver
`docs/SECURITY.md §Logging`). Métricas y tracing externos quedan fuera del alcance
del MVP pero la interfaz de logging ya es compatible con reenviarlos a un colector
(Datadog, Grafana Loki, etc.) sin cambios de código de negocio.
