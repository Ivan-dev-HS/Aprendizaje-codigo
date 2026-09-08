# Base de datos

Motor: PostgreSQL 16. ORM/migraciones: Prisma. Esquema fuente de verdad:
`packages/database/prisma/schema.prisma`.

## Dominios del modelo

| Dominio               | Modelos principales                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| Identidad             | `User`, `Profile`, `Session`, `PasswordResetToken`                                                       |
| Aprendizaje           | `Course`, `Module`, `Lesson`, `LessonProgress`, `Skill`, `UserSkill`, `LearningPath`, `LearningPathItem` |
| Ejercicios            | `Exercise`, `ExerciseAttempt`                                                                            |
| Labs                  | `PlaygroundSnapshot`, `TerminalLabState`, `GitLabState`, `SqlLabDataset`                                 |
| Casos reales          | `Case`, `CaseAttempt`                                                                                    |
| Proyectos             | `Project`, `ProjectTask`, `UserProject`, `ProjectProgress`                                               |
| Empresa (Nexora Tech) | `Sprint`, `Ticket`, `TicketComment`, `PullRequest`, `CodeReview`, `StandupEntry`                         |
| Entrevistas           | `InterviewQuestion`, `Interview`, `InterviewTemplateQuestion`, `InterviewAttempt`, `InterviewAnswer`     |
| Gamificación          | `Achievement`, `UserAchievement`, `Mission`, `UserMission`, `XpEvent`                                    |
| Portfolio/CV          | `Portfolio`, `Resume`                                                                                    |
| Plataforma            | `Notification`, `ProgressEvent`, `AuditLog`, `FeatureFlag`                                               |

## Convenciones

- IDs: `cuid()`.
- Contenido educativo versionado vía `contentVersion` en `Course`, `Lesson` y
  `Exercise` (sección 103), incrementado cuando se reescribe contenido publicado.
- Los campos `Json` (`content`, `prompt`, `hints`, `solution`, `tests`, `criteria`...)
  guardan estructuras específicas por tipo, documentadas junto a su validador Zod en
  `@codeforge/validators` — nunca se leen sin pasar por ese esquema.
- Toda tabla de alto volumen con una FK de acceso frecuente tiene índice explícito
  (`userId`, `courseId` vía `Module.courseId`, `skillId`, `exerciseId`,
  `Ticket.status`, `projectId`) — sección 99 de SPEC.md.
- Borrado en cascada (`onDelete: Cascade`) en toda relación "detalle de un usuario"
  (sesiones, intentos, progreso...); nunca en catálogos (`Course`, `Exercise`, etc.).

## Rol de solo lectura para el SQL Lab

Migración dedicada (`*_sandbox_role`) crea:

```sql
CREATE SCHEMA IF NOT EXISTS sandbox;
CREATE ROLE codeforge_sandbox LOGIN PASSWORD '...' NOSUPERUSER NOCREATEDB NOCREATEROLE;
GRANT USAGE ON SCHEMA sandbox TO codeforge_sandbox;
GRANT SELECT ON ALL TABLES IN SCHEMA sandbox TO codeforge_sandbox;
ALTER DEFAULT PRIVILEGES IN SCHEMA sandbox GRANT SELECT ON TABLES TO codeforge_sandbox;
REVOKE ALL ON SCHEMA public FROM codeforge_sandbox;
```

Las tablas de cada ejercicio de SQL Lab se crean en `sandbox` a partir de
`SqlLabDataset.schemaSql`/`seedSql` (seed idempotente, sección 98).

> **Nota operativa:** el rol de la aplicación (`DATABASE_URL`, `codeforge` en
> desarrollo) necesita el atributo `CREATEROLE` en PostgreSQL para poder aplicar la
> migración `sandbox_role` (que ejecuta `CREATE ROLE codeforge_sandbox`). En una base
> de datos gestionada (RDS, Cloud SQL, etc.) donde el rol de aplicación no pueda
> tener `CREATEROLE`, aplica esa migración una vez con un rol administrador y
> continúa con `codeforge` para el resto — no vuelve a ejecutarse tras la primera vez.

## Migraciones y seeds

- `pnpm db:migrate` (dev, crea migración) / `pnpm db:migrate:deploy` (aplica en
  CI/producción) — nunca se edita el esquema de PostgreSQL a mano (sección 97).
- `pnpm db:seed` ejecuta `packages/database/prisma/seed/index.ts`, que es
  **idempotente**: usa `upsert` por `slug`/`email` únicos, por lo que ejecutarlo
  repetidamente no duplica datos (sección 98).
