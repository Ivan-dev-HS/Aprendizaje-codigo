import { describe, expect, it } from "vitest";
import {
  createInitialTerminalState,
  runTerminalCommand,
  type TerminalState,
} from "./terminal-engine.js";

function run(state: TerminalState, command: string) {
  return runTerminalCommand(state, command);
}

describe("terminal-engine", () => {
  it("pwd/ls reflejan el estado inicial (home/user con README.md y projects/)", () => {
    const state = createInitialTerminalState();
    expect(run(state, "pwd").entry.output).toEqual(["/home/user"]);
    const ls = run(state, "ls");
    expect(ls.entry.output).toEqual(["README.md", "projects"]);
    expect(ls.entry.isError).toBe(false);
  });

  it("cd navega y actualiza cwd; cd a ruta inexistente falla sin mutar el estado", () => {
    const state = createInitialTerminalState();
    const afterCd = run(state, "cd projects").state;
    expect(afterCd.cwd).toBe("/home/user/projects");

    const fail = run(state, "cd /no/existe");
    expect(fail.entry.isError).toBe(true);
    expect(fail.state.cwd).toBe("/home/user");
  });

  it("mkdir crea directorios; mkdir sin -p falla si el padre no existe", () => {
    let state = createInitialTerminalState();
    state = run(state, "mkdir demo").state;
    expect(run(state, "ls").entry.output).toContain("demo");

    const fail = run(state, "mkdir a/b/c");
    expect(fail.entry.isError).toBe(true);

    const ok = run(state, "mkdir -p a/b/c");
    expect(ok.entry.isError).toBe(false);
    const lsAbc = run(ok.state, "ls a/b");
    expect(lsAbc.entry.output).toEqual(["c"]);
  });

  it("touch + echo con redirección crean y sobrescriben/añaden archivos; cat los lee", () => {
    let state = createInitialTerminalState();
    state = run(state, "touch nota.txt").state;
    expect(run(state, "cat nota.txt").entry.output).toEqual([]);

    state = run(state, 'echo "hola mundo" > nota.txt').state;
    expect(run(state, "cat nota.txt").entry.output).toEqual(["hola mundo"]);

    state = run(state, 'echo "otra linea" >> nota.txt').state;
    expect(run(state, "cat nota.txt").entry.output).toEqual(["hola mundo", "otra linea"]);
  });

  it("rm falla en directorios sin -r, y funciona con -r", () => {
    let state = createInitialTerminalState();
    const failEmpty = run(state, "rm projects");
    expect(failEmpty.entry.isError).toBe(true);

    state = run(state, "mkdir demo").state;
    state = run(state, "touch demo/a.txt").state;
    const failNested = run(state, "rm demo");
    expect(failNested.entry.isError).toBe(true);

    const ok = run(state, "rm -r demo");
    expect(ok.entry.isError).toBe(false);
    expect(run(ok.state, "ls").entry.output).not.toContain("demo");
  });

  it("cp copia sin borrar el origen; mv mueve y borra el origen", () => {
    let state = createInitialTerminalState();
    state = run(state, 'echo "contenido" > origen.txt').state;

    state = run(state, "cp origen.txt copia.txt").state;
    expect(run(state, "ls").entry.output).toEqual(
      expect.arrayContaining(["origen.txt", "copia.txt"]),
    );
    expect(run(state, "cat copia.txt").entry.output).toEqual(["contenido"]);

    state = run(state, "mv copia.txt movida.txt").state;
    const ls = run(state, "ls").entry.output;
    expect(ls).not.toContain("copia.txt");
    expect(ls).toContain("movida.txt");
  });

  it("un comando desconocido devuelve isError true sin lanzar excepción", () => {
    const state = createInitialTerminalState();
    const result = run(state, "no-existo --flag");
    expect(result.entry.isError).toBe(true);
    expect(result.entry.output[0]).toMatch(/comando no encontrado/);
  });
});
