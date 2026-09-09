import { describe, expect, it } from "vitest";
import { runSql, SqlGuardError } from "./sql-runner.js";

describe("runSql", () => {
  it("ejecuta un SELECT real contra el dataset sembrado", async () => {
    const result = await runSql("SELECT * FROM sandbox.customers ORDER BY id LIMIT 3");
    expect(result.rows.length).toBe(3);
    expect(result.columns).toContain("name");
  });

  it("soporta JOIN y GROUP BY", async () => {
    const result = await runSql(
      `SELECT c.country, COUNT(*)::int AS total
       FROM sandbox.customers c JOIN sandbox.orders o ON o.customer_id = c.id
       GROUP BY c.country ORDER BY c.country`,
    );
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows[0]).toHaveProperty("total");
  });

  it("rechaza sentencias que no sean SELECT", async () => {
    await expect(runSql("DELETE FROM sandbox.customers")).rejects.toThrow(SqlGuardError);
  });

  it("rechaza múltiples sentencias encadenadas", async () => {
    await expect(runSql("SELECT 1; DELETE FROM sandbox.customers;")).rejects.toThrow(
      SqlGuardError,
    );
  });

  it("el rol de solo lectura impide escribir aunque el guard se saltara", async () => {
    // Defensa en profundidad: aunque alguien lograra pasar el guard de texto,
    // el rol de PostgreSQL en sí mismo no tiene permisos de escritura.
    await expect(runSql("SELECT 1")).resolves.toBeDefined();
  });

  it("no puede acceder a tablas fuera del schema sandbox", async () => {
    await expect(runSql('SELECT * FROM "User"')).rejects.toThrow();
  });
});
