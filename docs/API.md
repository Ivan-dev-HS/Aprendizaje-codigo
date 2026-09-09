# API

Base URL: `http://localhost:4000/api/v1` (desarrollo). Formato: JSON.
Especificación OpenAPI (se irá completando por fase): `apps/api/openapi.yaml`.

## Convenciones

- Autenticación: header `Authorization: Bearer <accessToken>`. El refresh token
  viaja en una cookie `httpOnly` gestionada automáticamente por el navegador.
- Errores: siempre `{ "error": { "code", "message", "details"? } }` con el HTTP
  status correspondiente (400 validación, 401 no autenticado, 403 sin permiso, 404,
  409 conflicto, 429 rate limit, 500 error interno sin detalles en producción).
- Listados: paginados con `?page=&pageSize=`, respuesta
  `{ "items": [...], "meta": { "page", "pageSize", "total", "totalPages" } }`.
- Rutas de administración bajo `/admin/*`, protegidas por `requireRole("ADMIN")`
  verificado en backend.

## Endpoints (se amplía en cada fase)

| Método         | Ruta                                                   | Descripción                                                                                               | Fase |
| -------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ---- |
| GET            | `/health`                                              | Estado de la API y la base de datos                                                                       | 1    |
| POST           | `/auth/register`                                       | Registro de usuario                                                                                       | 2    |
| POST           | `/auth/login`                                          | Login                                                                                                     | 2    |
| POST           | `/auth/logout`                                         | Logout (revoca sesión)                                                                                    | 2    |
| POST           | `/auth/refresh`                                        | Rota el access token usando la cookie de refresh                                                          | 2    |
| POST           | `/auth/password-reset/request`                         | Solicita recuperación de contraseña                                                                       | 2    |
| POST           | `/auth/password-reset/confirm`                         | Confirma nueva contraseña con token                                                                       | 2    |
| GET            | `/users/me`                                            | Perfil del usuario autenticado                                                                            | 2    |
| PATCH          | `/users/me`                                            | Actualiza perfil                                                                                          | 2    |
| GET            | `/onboarding/quiz`                                     | Evaluación inicial (sin respuestas correctas)                                                             | 2    |
| POST           | `/onboarding`                                          | Completa el asistente de onboarding                                                                       | 2    |
| GET            | `/courses`, `/courses/:slug`                           | Catálogo de cursos                                                                                        | 3    |
| GET            | `/lessons/:id`                                         | Detalle de lección                                                                                        | 3    |
| POST           | `/lessons/:id/complete`                                | Marca lección completada                                                                                  | 3    |
| GET            | `/learning-paths/me`                                   | Roadmap del usuario                                                                                       | 3    |
| GET            | `/skills`, `/skills/me`                                | Catálogo de skills / maestría del usuario                                                                 | 3    |
| GET            | `/exercises`, `/exercises/:id`                         | Catálogo/detalle de ejercicios (filtrable por skill/dificultad/tipo)                                      | 4    |
| GET            | `/exercises/:id/hints/:level`                          | Pista progresiva (1-3), nunca la solución                                                                 | 4    |
| POST           | `/exercises/:id/attempt`                               | Corrige un intento, otorga XP (una vez) y actualiza la maestría de la skill                               | 4    |
| GET/POST       | `/labs/playground`                                     | Lista / crea snapshots HTML/CSS/JS del usuario                                                            | 5    |
| GET/PUT/DELETE | `/labs/playground/:id`                                 | Detalle / actualiza / borra un snapshot                                                                   | 5    |
| POST           | `/labs/js/run`                                         | Ejecuta JavaScript vía exec-service (worker aislado)                                                      | 5    |
| POST           | `/labs/sql/run`                                        | Ejecuta un SELECT vía exec-service (rol de solo lectura)                                                  | 5    |
| GET            | `/labs/sql/datasets`                                   | Datasets disponibles para el SQL Lab                                                                      | 5    |
| GET/POST       | `/labs/terminal`                                       | Estado y comandos de la Terminal Lab (sistema de archivos virtual)                                        | 5    |
| GET/POST       | `/labs/git`                                            | Estado y comandos de la Git Lab (grafo de commits simulado)                                               | 5    |
| GET            | `/cases`, `/cases/:id`                                 | Debugging / IT Support / Networking / Producción (filtrable por kind/domain)                              | 7    |
| GET            | `/cases/:id/hints/:level`                              | Pista progresiva (1-3), nunca la solución                                                                 | 7    |
| POST           | `/cases/:id/attempt`                                   | Envía diagnóstico (opción múltiple) + postmortem si aplica                                                | 7    |
| GET            | `/projects`, `/projects/:slug`                         | Catálogo de proyectos (con estado del usuario si hay sesión)                                              | 6    |
| POST           | `/projects/:id/start`                                  | Inicia un proyecto (idempotente)                                                                          | 6    |
| PATCH          | `/projects/:id`                                        | githubUrl/demoUrl/readme/screenshots/technologies del usuario                                             | 6    |
| POST           | `/projects/:id/tasks/:taskId/complete`                 | Marca una tarea hecha; al completar todas otorga XP una vez                                               | 6    |
| GET/PATCH      | `/portfolio/me`                                        | Ajustes (isPublic/headline/theme) + vista previa compuesta en vivo                                        | 6    |
| GET            | `/portfolio/:username`                                 | Portfolio público (404 si no existe o no es público)                                                      | 6    |
| GET/PATCH      | `/resume/me`                                           | CV builder: resumen/experiencia/educación/enlaces + skills/proyectos reales                               | 6    |
| GET            | `/tickets`, `/tickets/:id`                             | Tablero compartido de Nexora Tech (filtrable por sprintId/status)                                         | 7    |
| PATCH          | `/tickets/:id`                                         | Autoasignarse (`assignToMe`) y/o cambiar status (solo la persona asignada)                                | 7    |
| POST           | `/tickets/:id/comments`                                | Comenta en un ticket (cualquier usuario autenticado)                                                      | 7    |
| GET            | `/sprints/current`                                     | Sprint activo + desglose de tickets por status                                                            | 7    |
| POST           | `/standups`                                            | Daily standup: yesterday/today/blockers + puntuación de comunicación (heurística basada en reglas, no IA) | 7    |
| GET            | `/standups/me`                                         | Historial de standups del usuario                                                                         | 7    |
| GET            | `/pull-requests`, `/pull-requests/:id`                 | Ejercicios de code review (PRs de compañeros con issues plantados)                                        | 7    |
| POST           | `/pull-requests/:id/review`                            | Envía el review (opción múltiple sobre `candidateIssues`) y lo puntúa                                     | 7    |
| GET            | `/interviews`, `/interviews/:slug`                     | Banco/plantillas de entrevista                                                                            | 8    |
| POST           | `/interviews/:id/start`, POST `/interviews/:id/answer` | Simulación de entrevista                                                                                  | 8    |
| GET            | `/gamification/me`                                     | XP, nivel, racha, achievements, missions                                                                  | 9    |
| GET            | `/notifications`                                       | Notificaciones del usuario                                                                                | 9    |
| GET            | `/search?q=`                                           | Búsqueda global                                                                                           | 9    |
| GET            | `/admin/*`                                             | CRUD de administración (courses, exercises, users...)                                                     | 10   |
| GET            | `/admin/analytics`                                     | Analítica agregada                                                                                        | 10   |

## Eventos de analítica (sección 104)

Registrados internamente vía `ProgressEvent` (nunca expuestos como endpoint público
de escritura libre): `lesson_started`, `lesson_completed`, `exercise_started`,
`exercise_completed`, `exercise_failed`, `project_started`, `project_completed`,
`ticket_started`, `ticket_completed`, `interview_started`, `interview_completed`,
`skill_mastered`.
