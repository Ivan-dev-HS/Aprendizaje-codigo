import { randomBytes } from "node:crypto";
import type { GitCommit, TerminalHistoryEntry } from "@codeforge/types";
import { tokenizeCommand } from "./command-tokenizer.js";

/**
 * Git Lab (sección 22 de SPEC.md): un motor de grafo de commits simulado,
 * inspirado en herramientas de referencia como "Learn Git Branching". No
 * envuelve al binario `git` real ni simula contenido de archivos con diffs;
 * el objetivo pedagógico es el modelo mental de commits/ramas/merge, que un
 * grafo determinista en memoria enseña igual de bien y sin superficie de
 * ataque (nunca se ejecuta un proceso `git` real).
 */
export interface GitState {
  commits: Record<string, GitCommit>;
  branches: Record<string, string>;
  head: { type: "branch"; name: string } | { type: "detached"; commitId: string };
  staged: string[];
  initialized: boolean;
}

export function createInitialGitState(): GitState {
  return {
    commits: {},
    branches: {},
    head: { type: "branch", name: "main" },
    staged: [],
    initialized: false,
  };
}

function currentCommitId(state: GitState): string | null {
  if (state.head.type === "detached") return state.head.commitId;
  return state.branches[state.head.name] ?? null;
}

function isAncestor(state: GitState, ancestorId: string, commitId: string): boolean {
  if (ancestorId === commitId) return true;
  const visited = new Set<string>();
  const queue = [commitId];
  while (queue.length) {
    const id = queue.shift() as string;
    if (visited.has(id)) continue;
    visited.add(id);
    const commit = state.commits[id];
    if (!commit) continue;
    if (commit.parentIds.includes(ancestorId)) return true;
    queue.push(...commit.parentIds);
  }
  return false;
}

function newCommitId(state: GitState): string {
  let id = randomBytes(4).toString("hex");
  while (state.commits[id]) id = randomBytes(4).toString("hex");
  return id;
}

function parseCommitMessage(args: string[]): string | null {
  const flagIndex = args.indexOf("-m");
  if (flagIndex === -1) return null;
  return args[flagIndex + 1] ?? null;
}

export interface GitRunResult {
  state: GitState;
  entry: TerminalHistoryEntry;
}

export function runGitCommand(state: GitState, rawCommand: string): GitRunResult {
  const tokens = tokenizeCommand(rawCommand.trim());
  const [git, sub, ...args] = tokens;

  const fail = (message: string): GitRunResult => ({
    state,
    entry: { command: rawCommand, output: [message], isError: true },
  });
  const ok = (nextState: GitState, output: string[]): GitRunResult => ({
    state: nextState,
    entry: { command: rawCommand, output, isError: false },
  });

  if (!git) return ok(state, []);
  if (git !== "git") {
    return fail(
      `${git}: comando no encontrado. La Git Lab solo entiende comandos 'git'.`,
    );
  }
  if (!sub)
    return fail(
      "git: falta un subcomando (init, status, add, commit, log, branch, checkout, merge).",
    );
  if (sub !== "init" && !state.initialized) {
    return fail("fatal: no es un repositorio git. Ejecuta 'git init' primero.");
  }

  switch (sub) {
    case "init": {
      if (state.initialized) return fail("El repositorio ya está inicializado.");
      return ok({ ...createInitialGitState(), initialized: true }, [
        "Repositorio Git inicializado en la rama 'main'.",
      ]);
    }
    case "status": {
      const lines: string[] = [
        state.head.type === "branch"
          ? `En la rama ${state.head.name}`
          : `HEAD separada en ${state.head.commitId.slice(0, 7)}`,
      ];
      if (state.staged.length) {
        lines.push(
          "Cambios preparados para el commit:",
          ...state.staged.map((f) => `  ${f}`),
        );
      } else {
        lines.push("Nada que confirmar (staging area vacía).");
      }
      return ok(state, lines);
    }
    case "add": {
      if (!args.length) return fail("git add: falta un archivo (o usa '.').");
      const staged = new Set(state.staged);
      for (const target of args) staged.add(target);
      return ok({ ...state, staged: [...staged] }, [
        `Añadido a la staging area: ${args.join(", ")}`,
      ]);
    }
    case "commit": {
      const message = parseCommitMessage(args);
      if (!message) return fail('git commit: usa -m "mensaje del commit".');
      if (!state.staged.length) return fail("Nada que confirmar: usa 'git add' primero.");

      const parentId = currentCommitId(state);
      const id = newCommitId(state);
      const commit: GitCommit = {
        id,
        parentIds: parentId ? [parentId] : [],
        message,
        branch: state.head.type === "branch" ? state.head.name : "detached",
        createdAt: new Date().toISOString(),
      };
      const commits = { ...state.commits, [id]: commit };
      const branches =
        state.head.type === "branch"
          ? { ...state.branches, [state.head.name]: id }
          : state.branches;
      const head =
        state.head.type === "detached"
          ? { type: "detached" as const, commitId: id }
          : state.head;

      return ok({ ...state, commits, branches, head, staged: [] }, [
        `[${commit.branch} ${id.slice(0, 7)}] ${message}`,
      ]);
    }
    case "log": {
      const startId = currentCommitId(state);
      if (!startId) return ok(state, ["Todavía no hay commits."]);
      const oneline = args.includes("--oneline");
      const visited = new Set<string>();
      const queue = [startId];
      const collected: GitCommit[] = [];
      while (queue.length) {
        const id = queue.shift() as string;
        if (visited.has(id)) continue;
        visited.add(id);
        const commit = state.commits[id];
        if (!commit) continue;
        collected.push(commit);
        queue.push(...commit.parentIds);
      }
      collected.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const lines = collected.map((c) =>
        oneline
          ? `${c.id.slice(0, 7)} ${c.message}`
          : `commit ${c.id}\nMensaje: ${c.message}`,
      );
      return ok(state, lines);
    }
    case "branch": {
      if (args[0] === "-d" || args[0] === "-D") {
        const name = args[1];
        if (!name) return fail("git branch -d: falta el nombre de la rama.");
        if (!(name in state.branches)) return fail(`La rama '${name}' no existe.`);
        if (state.head.type === "branch" && state.head.name === name) {
          return fail(`No puedes eliminar la rama actual ('${name}').`);
        }
        const branches = { ...state.branches };
        delete branches[name];
        return ok({ ...state, branches }, [`Rama '${name}' eliminada.`]);
      }
      if (!args.length) {
        const names = Object.keys(state.branches).sort();
        const lines = names.map((n) =>
          state.head.type === "branch" && state.head.name === n ? `* ${n}` : `  ${n}`,
        );
        return ok(state, lines.length ? lines : ["(sin ramas todavía; usa 'git init')"]);
      }
      const name = args[0] as string;
      if (name in state.branches) return fail(`La rama '${name}' ya existe.`);
      const head = currentCommitId(state);
      if (!head) return fail("No se puede crear una rama: todavía no hay commits.");
      return ok({ ...state, branches: { ...state.branches, [name]: head } }, [
        `Rama '${name}' creada en ${head.slice(0, 7)}.`,
      ]);
    }
    case "checkout":
    case "switch": {
      const createFlag = args[0] === "-b" || args[0] === "-c";
      const name = createFlag ? args[1] : args[0];
      if (!name) return fail(`git ${sub}: falta el nombre de la rama.`);

      if (createFlag) {
        if (name in state.branches) return fail(`La rama '${name}' ya existe.`);
        const head = currentCommitId(state);
        const branches = { ...state.branches, [name]: head ?? "" };
        return ok({ ...state, branches, head: { type: "branch", name } }, [
          `Rama '${name}' creada y activada.`,
        ]);
      }
      if (!(name in state.branches)) return fail(`No existe la rama '${name}'.`);
      return ok({ ...state, head: { type: "branch", name } }, [
        `Cambiado a la rama '${name}'.`,
      ]);
    }
    case "merge": {
      if (state.head.type !== "branch")
        return fail("No puedes hacer merge con HEAD separada.");
      const name = args[0];
      if (!name) return fail("git merge: falta el nombre de la rama a fusionar.");
      if (!(name in state.branches)) return fail(`No existe la rama '${name}'.`);

      const currentId = state.branches[state.head.name] ?? null;
      const targetId = state.branches[name] as string;
      if (!targetId) return fail(`La rama '${name}' todavía no tiene commits.`);

      if (!currentId) {
        return ok(
          { ...state, branches: { ...state.branches, [state.head.name]: targetId } },
          [`Fast-forward: '${state.head.name}' ahora apunta a ${targetId.slice(0, 7)}.`],
        );
      }
      if (currentId === targetId || isAncestor(state, targetId, currentId)) {
        return ok(state, ["Ya está actualizado."]);
      }
      if (isAncestor(state, currentId, targetId)) {
        return ok(
          { ...state, branches: { ...state.branches, [state.head.name]: targetId } },
          [`Fast-forward: '${state.head.name}' ahora apunta a ${targetId.slice(0, 7)}.`],
        );
      }

      const id = newCommitId(state);
      const commit: GitCommit = {
        id,
        parentIds: [currentId, targetId],
        message: `Merge branch '${name}' into ${state.head.name}`,
        branch: state.head.name,
        createdAt: new Date().toISOString(),
      };
      return ok(
        {
          ...state,
          commits: { ...state.commits, [id]: commit },
          branches: { ...state.branches, [state.head.name]: id },
        },
        [`Merge commit ${id.slice(0, 7)}: fusionada '${name}' en '${state.head.name}'.`],
      );
    }
    default:
      return fail(`git: '${sub}' no es un comando soportado en la Git Lab.`);
  }
}

export function commitsSorted(state: GitState): GitCommit[] {
  return Object.values(state.commits).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
}
