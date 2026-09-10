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

## Despliegue en Vercel + Supabase

Alternativa sin servidor propio (sin Docker), pensada para tener una URL pública
estable sin depender de que un ordenador esté encendida. Se despliegan **3
proyectos Vercel independientes** apuntando al mismo repositorio (uno por
`apps/*`, cada uno con su propio "Root Directory") más **1 proyecto Supabase**
(PostgreSQL administrado) para la base de datos.

- `apps/web` — SPA estática, Vercel la detecta como proyecto Vite normal.
- `apps/api` y `apps/exec-service` — Express, servido como función serverless
  vía `apps/*/api/index.ts` (exporta `createApp()`) + `apps/*/vercel.json`
  (reescribe todas las rutas a esa función).

Diferencias respecto al despliegue con Docker Compose que exige este modelo:

1. **Cookie de sesión cross-domain**: al vivir `web` y `api` en subdominios
   `*.vercel.app` distintos (sin dominio padre común), la cookie de refresh
   necesita `COOKIE_SAME_SITE=none` (+ `COOKIE_SECURE=true`, ya obligatorio
   ahí) para que el navegador la envíe en peticiones cross-site — ver
   `COOKIE_SAME_SITE` en `apps/api/src/config/env.ts`. En Docker Compose
   (mismo origen o reverse proxy común) el valor por defecto `lax` sigue
   siendo el correcto.
2. **Worker de JS Lab por `eval`, no por ruta de archivo**: un bundle
   serverless de una sola función no incluye un archivo `.ts` referenciado
   solo por una ruta calculada en runtime (`new Worker(rutaAlArchivo)`), así
   que `apps/exec-service/src/modules/exec/js-runner.ts` pasa el código del
   worker como string plano vía `new Worker(source, { eval: true })` — ver el
   comentario en ese archivo. Funciona igual en local (Docker/dev) y en
   Vercel, sin build step adicional.
3. **Conexión a Postgres vía el _connection pooler_ de Supabase**
   (`aws-0-<region>.pooler.supabase.com:6543`, con `?pgbouncer=true`), no la
   conexión directa (`db.<ref>.supabase.co:5432`) — las funciones serverless
   abren muchas conexiones cortas y el pooler está pensado exactamente para
   eso; la conexión directa además solo resuelve por IPv6 en proyectos nuevos
   de Supabase.
4. **Migraciones y seed**: como no hay una máquina persistente corriendo
   `prisma migrate deploy`, se aplican una vez de forma manual contra
   Supabase (vía su SQL editor/API, o `prisma migrate deploy` apuntando a la
   conexión directa desde cualquier máquina con red sin restricciones) antes
   del primer despliegue — no es parte del pipeline de cada deploy.

Variables de entorno por proyecto (nombres — los valores reales nunca se
commitean, se configuran en el dashboard de cada proyecto Vercel):

| Proyecto                 | Variables                                                                                                                                                                                                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `codeforge-api`          | `DATABASE_URL` (pooler), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `EXEC_SERVICE_INTERNAL_TOKEN`, `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=none`, `CORS_ORIGIN` (URL de `codeforge-web`), `EXEC_SERVICE_URL` (URL de `codeforge-exec-service`), `NODE_ENV=production` |
| `codeforge-exec-service` | `EXEC_SERVICE_INTERNAL_TOKEN` (idéntico al de la API), `SANDBOX_DATABASE_URL` (pooler, rol `codeforge_sandbox`), `NODE_ENV=production`                                                                                                                                |
| `codeforge-web`          | `VITE_API_URL` (URL de `codeforge-api` + `/api/v1`)                                                                                                                                                                                                                   |

## Salud y observabilidad

`GET /api/v1/health` comprueba conectividad con PostgreSQL y se usa como
`HEALTHCHECK` en `docker-compose.yml`. Logging estructurado con `pino` (ver
`docs/SECURITY.md §Logging`). Métricas y tracing externos quedan fuera del alcance
del MVP pero la interfaz de logging ya es compatible con reenviarlos a un colector
(Datadog, Grafana Loki, etc.) sin cambios de código de negocio.
