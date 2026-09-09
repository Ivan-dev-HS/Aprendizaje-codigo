import { prisma } from "../../src/client.js";

/**
 * Dataset real para el SQL Lab (sección 20 de SPEC.md): una mini tienda
 * online con clientes y pedidos, suficiente para practicar SELECT, WHERE,
 * JOIN, GROUP BY y funciones de agregación. Las tablas viven en el schema
 * `sandbox` (ver migración `sandbox_role`), al que el rol de solo lectura
 * `codeforge_sandbox` usado por el exec-service tiene acceso — nunca al
 * resto de la aplicación. Se siembra con el rol de la app (con privilegios
 * de escritura sobre `sandbox`), no con el rol de solo lectura.
 */
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sandbox.customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sandbox.orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES sandbox.customers(id),
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at DATE NOT NULL
);
`;

const SEED_SQL = `
TRUNCATE sandbox.orders, sandbox.customers RESTART IDENTITY CASCADE;

INSERT INTO sandbox.customers (name, email, country) VALUES
  ('Ana García', 'ana@example.local', 'España'),
  ('Bruno Rossi', 'bruno@example.local', 'Italia'),
  ('Chloé Martin', 'chloe@example.local', 'Francia'),
  ('Diego Fernández', 'diego@example.local', 'España'),
  ('Elena Popescu', 'elena@example.local', 'Rumanía'),
  ('Farid Al-Sayed', 'farid@example.local', 'Egipto'),
  ('Greta Müller', 'greta@example.local', 'Alemania'),
  ('Hana Kowalski', 'hana@example.local', 'Polonia');

INSERT INTO sandbox.orders (customer_id, total, status, created_at) VALUES
  (1, 49.99, 'completed', '2026-01-05'),
  (1, 120.50, 'completed', '2026-02-14'),
  (2, 15.00, 'cancelled', '2026-01-20'),
  (3, 89.90, 'completed', '2026-03-01'),
  (3, 32.20, 'completed', '2026-03-15'),
  (4, 210.00, 'completed', '2026-01-10'),
  (4, 45.00, 'pending', '2026-04-02'),
  (5, 12.99, 'completed', '2026-02-28'),
  (6, 78.40, 'completed', '2026-03-22'),
  (7, 156.75, 'completed', '2026-01-30'),
  (7, 23.10, 'cancelled', '2026-02-05'),
  (8, 99.99, 'completed', '2026-03-18'),
  (2, 64.20, 'completed', '2026-04-10'),
  (5, 18.50, 'completed', '2026-04-12'),
  (6, 200.00, 'pending', '2026-04-15');
`;

/**
 * Prisma no admite varias sentencias en un solo `$executeRawUnsafe` (usa
 * prepared statements). Como este SQL es contenido estático de desarrollo
 * (nunca input de usuario), dividir por `;` es seguro aquí.
 */
async function executeStatements(sql: string) {
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
}

export async function seedSqlLab() {
  await executeStatements(SCHEMA_SQL);
  await executeStatements(SEED_SQL);

  await prisma.sqlLabDataset.upsert({
    where: { slug: "tienda-online" },
    update: {
      title: "Tienda online",
      description:
        "Clientes y pedidos de una tienda ficticia. Practica SELECT, WHERE, JOIN, GROUP BY y funciones de agregación.",
      schemaSql: SCHEMA_SQL,
      seedSql: SEED_SQL,
    },
    create: {
      slug: "tienda-online",
      title: "Tienda online",
      description:
        "Clientes y pedidos de una tienda ficticia. Practica SELECT, WHERE, JOIN, GROUP BY y funciones de agregación.",
      schemaSql: SCHEMA_SQL,
      seedSql: SEED_SQL,
    },
  });

  console.log("  ✔ 1 dataset del SQL Lab (sandbox.customers, sandbox.orders)");
}
