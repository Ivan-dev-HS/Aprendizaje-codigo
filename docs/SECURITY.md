# Seguridad

## Autenticación y sesión

- Contraseñas con `bcryptjs` (12 salt rounds). Nunca se almacenan ni se loguean en claro.
- Access token JWT de corta duración (15 min por defecto) + refresh token de larga
  duración (7 días), rotado en cada uso, almacenado como cookie `httpOnly`,
  `SameSite=Lax` (o `Strict` en producción) y `Secure` cuando `COOKIE_SECURE=true`.
  El hash del refresh token (nunca el token en claro) se guarda en la tabla `Session`,
  lo que permite revocar sesiones individuales.
- Recuperación de contraseña: token de un solo uso con expiración corta, cuyo hash
  se guarda en `PasswordResetToken`. El envío de email usa un `EmailProvider` con
  implementación `LoggingEmailProvider` (registra el envío en logs, no manda un
  email real) — interfaz lista para conectar un proveedor real (sección 87/96).

## Autorización

Nunca se confía en el frontend. Todo endpoint que requiera un rol concreto pasa por
middleware `requireAuth` / `requireRole("ADMIN")` en `apps/api`, verificado contra el
JWT firmado por el servidor. El frontend oculta UI según el rol solo por UX; el
servidor es quien decide.

## Superficies de entrada

- Todo body/query/param de request se valida con esquemas Zod (`@codeforge/validators`)
  antes de tocar lógica de negocio. Los errores de validación devuelven 400 con
  detalles por campo, nunca un stack trace.
- `helmet` para cabeceras seguras (incluye CSP restrictiva) en `apps/api`.
- CORS restringido a `CORS_ORIGIN` (allowlist explícita por entorno).
- Rate limiting general (`express-rate-limit`) y un límite más estricto específico en
  `/auth/*` para mitigar fuerza bruta y credential stuffing.
- Prisma parametriza todas las queries por defecto (protección SQL injection). El
  único punto donde se ejecuta SQL "libre" es el SQL Lab, ver más abajo.
- Sanitización de salida en el frontend (React escapa por defecto; cualquier HTML de
  usuario que se deba renderizar sin escape — p.ej. preview del HTML/CSS Playground —
  se aísla en un `<iframe sandbox>` sin `allow-same-origin`, nunca con `dangerouslySetInnerHTML`
  directo sobre el DOM de la app).
- Cabecera custom (`X-Requested-With`) + `SameSite` como mitigación adicional de CSRF
  en mutaciones basadas en cookie.

## Ejecución de código (sección 16/101 de SPEC.md)

Nunca se ejecuta código de usuario en el proceso de `apps/api`. Todo pasa por
`apps/exec-service`, que:

1. **No se expone a internet.** En `docker-compose.yml` no publica puertos al host,
   solo es alcanzable en la red interna por `api`. Además exige
   `X-Internal-Token` == `EXEC_SERVICE_INTERNAL_TOKEN` en cada request (middleware
   `requireInternalToken`).
2. **JavaScript**: se ejecuta dentro de un `node:worker_threads` Worker dedicado por
   request, con:
   - `resourceLimits` (límite de heap/memoria, `EXEC_JS_MEMORY_MB`);
   - timeout duro (`EXEC_JS_TIMEOUT_MS`) tras el cual el worker se termina
     forzosamente (`worker.terminate()`);
   - sin acceso a `fs`, `net`, `child_process`, `process.exit` real ni `require`
     dinámico: el worker corre el código de usuario dentro de un contexto `vm`
     mínimo, exponiendo solo `console` (capturado con límite de tamaño de salida,
     `EXEC_MAX_OUTPUT_BYTES`) y los globals seguros de ES2022;
   - el worker se destruye tras cada ejecución (sin reutilización de estado entre
     usuarios).
3. **SQL**: se ejecuta contra PostgreSQL real, pero:
   - con un rol de base de datos dedicado (`codeforge_sandbox`) que **solo** tiene
     `SELECT` sobre el schema `sandbox` (nunca sobre `public`, donde vive el resto de
     la aplicación) — ver migración `packages/database/prisma/migrations/*_sandbox_role`;
   - cada ejecución corre dentro de una transacción con `SET LOCAL statement_timeout`
     y termina siempre en `ROLLBACK` (defensa en profundidad aunque el rol ya sea de
     solo lectura);
   - un guard adicional en `apps/exec-service` rechaza cualquier entrada que no sea
     una única sentencia `SELECT` antes de enviarla a PostgreSQL.
4. **HTML/CSS**: el Playground renderiza el preview en un `<iframe sandbox="allow-scripts">`
   **sin** `allow-same-origin`, servido con `srcdoc`, en el propio navegador del
   usuario — no hay ejecución en el servidor y el iframe no puede acceder al origen
   de la aplicación ni a sus cookies.
5. **Terminal Lab y Git Lab**: son simulaciones puras en memoria (una máquina de
   estados que interpreta el subconjunto soportado de comandos/operaciones sobre una
   estructura de datos, no invocan ningún binario real de shell/git). Cero superficie
   de ataque real por construcción, no por límites de recursos.

Ver `IMPLEMENTATION_PLAN.md §7` para la justificación de por qué se eligió este
diseño en vez de contenedores Docker por ejecución.

## Logging

Logging estructurado (`pino`) con redacción automática de `password`, `passwordHash`,
`token`, `accessToken`, `refreshToken` y cabeceras `authorization`/`cookie`. Nunca se
loguean secretos ni PII innecesaria.

## Auditoría

Toda mutación desde `/api/v1/admin/*` escribe un registro en `AuditLog` (actor,
acción, entidad afectada, metadata) — sección 85.

## Errores

En producción (`NODE_ENV=production`) las respuestas de error nunca incluyen stack
traces ni detalles internos; solo `code` + `message` seguros para mostrar al usuario
(ver `apps/api/src/middleware/error-handler.ts`).
