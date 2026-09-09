import { describe, expect, it } from "vitest";
import { runJavaScript } from "./js-runner.js";

describe("runJavaScript", () => {
  it("ejecuta código simple y captura console.log", async () => {
    const result = await runJavaScript('console.log("hola", 1 + 1);');
    expect(result.errors).toEqual([]);
    expect(result.outputs).toEqual(["hola 2"]);
    expect(result.timedOut).toBe(false);
  });

  it("captura errores de sintaxis sin tirar el proceso", async () => {
    const result = await runJavaScript("const x = ;");
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("captura excepciones lanzadas por el propio código", async () => {
    const result = await runJavaScript('throw new Error("boom");');
    expect(result.errors[0]).toMatch(/boom/);
  });

  it("no tiene acceso a require ni process", async () => {
    const result = await runJavaScript("console.log(typeof require, typeof process);");
    expect(result.outputs).toEqual(["undefined undefined"]);
  });

  it("no puede leer el sistema de archivos", async () => {
    const result = await runJavaScript('require("node:fs").readFileSync("/etc/passwd");');
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toMatch(/require is not defined/);
  });

  it("corta la ejecución si se excede el timeout (bucle infinito)", async () => {
    const result = await runJavaScript("while (true) {}");
    expect(result.timedOut).toBe(true);
  }, 10_000);

  it("soporta async/await básico dentro de la ventana de ejecución", async () => {
    const result = await runJavaScript(
      'async function main() { await Promise.resolve(); console.log("async ok"); } main();',
    );
    expect(result.outputs).toContain("async ok");
  });

  it("trunca la salida si supera el límite de tamaño", async () => {
    const result = await runJavaScript(
      'for (let i = 0; i < 100000; i++) { console.log("x".repeat(100)); }',
    );
    expect(result.truncated).toBe(true);
  });
});
