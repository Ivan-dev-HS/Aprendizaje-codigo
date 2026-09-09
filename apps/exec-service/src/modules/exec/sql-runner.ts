import pg from "pg";
import { env } from "../../config/env.js";

const MAX_ROWS = 200;

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!env.SANDBOX_DATABASE_URL) {
    throw new Error("SANDBOX_DATABASE_URL no está configurado.");
  }
  pool ??= new pg.Pool({ connectionString: env.SANDBOX_DATABASE_URL, max: 5 });
  return pool;
}

export interface SqlRunResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  truncated: boolean;
  durationMs: number;
}

export class SqlGuardError extends Error {}

const FORBIDDEN_KEYWORDS =
  /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|execute|call|vacuum|reindex|comment|security|lock)\b/i;

/**
 * Defensa en profundidad además del rol de solo lectura (ver docs/SECURITY.md):
 * exige una única sentencia SELECT, sin palabras clave de escritura/DDL.
 */
function assertSafeSelect(sql: string): void {
  const trimmed = sql.trim();
  if (!trimmed) throw new SqlGuardError("La consulta está vacía.");

  const withoutTrailingSemicolon = trimmed.replace(/;\s*$/, "");
  if (withoutTrailingSemicolon.includes(";")) {
    throw new SqlGuardError("Solo se permite una única sentencia por ejecución.");
  }
  if (!/^select\b/i.test(withoutTrailingSemicolon)) {
    throw new SqlGuardError("El SQL Lab solo permite sentencias SELECT.");
  }
  if (FORBIDDEN_KEYWORDS.test(withoutTrailingSemicolon)) {
    throw new SqlGuardError(
      "La consulta contiene una palabra clave no permitida en el SQL Lab.",
    );
  }
}

export async function runSql(sql: string): Promise<SqlRunResult> {
  assertSafeSelect(sql);
  const startedAt = Date.now();
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    await client.query(`SET LOCAL statement_timeout = ${env.EXEC_SQL_TIMEOUT_MS}`);
    const result = await client.query(sql);
    const truncated = result.rows.length > MAX_ROWS;
    return {
      columns: result.fields.map((f) => f.name),
      rows: truncated ? result.rows.slice(0, MAX_ROWS) : result.rows,
      rowCount: result.rowCount ?? result.rows.length,
      truncated,
      durationMs: Date.now() - startedAt,
    };
  } finally {
    await client.query("ROLLBACK").catch(() => undefined);
    client.release();
  }
}
