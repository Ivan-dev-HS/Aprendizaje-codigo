-- Rol de solo lectura para el SQL Lab (ver docs/SECURITY.md §Ejecución de código
-- y docs/DATABASE.md §Rol de solo lectura para el SQL Lab).
--
-- El password fijado aquí es el valor de desarrollo por defecto (coincide con
-- SANDBOX_DB_PASSWORD en .env.example). En un entorno real, rota la contraseña
-- tras el despliegue ejecutando:
--   ALTER ROLE codeforge_sandbox WITH PASSWORD '<valor real de SANDBOX_DB_PASSWORD>';
-- (ver scripts/set-sandbox-password.mjs). Prisma Migrate no permite interpolar
-- variables de entorno dentro de un archivo de migración, de ahí este paso manual
-- documentado en vez de un secreto real embebido en el repositorio.
--
-- Este rol nunca debe tener privilegios fuera del schema `sandbox`: ni sobre
-- `public` (donde vive el resto de la aplicación) ni de escritura en ningún sitio.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'codeforge_sandbox') THEN
    CREATE ROLE codeforge_sandbox
      LOGIN
      PASSWORD 'codeforge_sandbox_password'
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      CONNECTION LIMIT 20;
  END IF;
END
$$;

CREATE SCHEMA IF NOT EXISTS sandbox;

-- Nunca debe poder tocar el schema de la aplicación.
REVOKE ALL ON SCHEMA public FROM codeforge_sandbox;

-- Solo lectura sobre `sandbox`, incluidas las tablas que se creen en el futuro
-- (cada SqlLabDataset añade sus propias tablas ahí vía seed).
GRANT USAGE ON SCHEMA sandbox TO codeforge_sandbox;
GRANT SELECT ON ALL TABLES IN SCHEMA sandbox TO codeforge_sandbox;
ALTER DEFAULT PRIVILEGES IN SCHEMA sandbox GRANT SELECT ON TABLES TO codeforge_sandbox;

-- Defensa en profundidad adicional al `SET LOCAL statement_timeout` que aplica
-- apps/exec-service por cada request: límite duro a nivel de rol.
ALTER ROLE codeforge_sandbox SET statement_timeout = '5s';
