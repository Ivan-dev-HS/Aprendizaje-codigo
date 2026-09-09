import type { TerminalHistoryEntry, VirtualFsNode } from "@codeforge/types";
import { tokenizeCommand } from "./command-tokenizer.js";

/**
 * Terminal Lab (sección 21 de SPEC.md): un intérprete de comandos determinista
 * sobre un sistema de archivos virtual en memoria. Nunca invoca un shell real
 * ni `child_process` — es intencionalmente una simulación, tanto por
 * seguridad (ver docs/SECURITY.md) como porque el objetivo pedagógico es
 * enseñar el modelo mental de un terminal Unix, no dar acceso al sistema real.
 */
export interface TerminalState {
  cwd: string;
  root: VirtualFsNode;
}

function dir(children: Record<string, VirtualFsNode> = {}): VirtualFsNode {
  return { type: "dir", children };
}

function file(content = ""): VirtualFsNode {
  return { type: "file", content };
}

export function createInitialTerminalState(): TerminalState {
  return {
    cwd: "/home/user",
    root: dir({
      home: dir({
        user: dir({
          "README.md": file(
            "Bienvenido a la Terminal Lab de CodeForge.\n\n" +
              "Comandos disponibles: pwd, ls, cd, mkdir, touch, cat, echo, rm, cp, mv, whoami, clear, help.\n",
          ),
          projects: dir({}),
        }),
      }),
    }),
  };
}

function splitPath(path: string): string[] {
  return path.split("/").filter(Boolean);
}

function resolveSegments(cwd: string, target: string): string[] {
  const base = target.startsWith("/") ? [] : splitPath(cwd);
  const parts = [...base, ...splitPath(target)];
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") {
      resolved.pop();
      continue;
    }
    resolved.push(part);
  }
  return resolved;
}

function segmentsToPath(segments: string[]): string {
  return segments.length ? `/${segments.join("/")}` : "/";
}

function getNode(root: VirtualFsNode, segments: string[]): VirtualFsNode | null {
  let node = root;
  for (const segment of segments) {
    const next = node.type === "dir" ? node.children?.[segment] : undefined;
    if (!next) return null;
    node = next;
  }
  return node;
}

function getParentAndName(
  root: VirtualFsNode,
  segments: string[],
): { parent: VirtualFsNode; name: string } | null {
  if (segments.length === 0) return null;
  const name = segments[segments.length - 1] as string;
  const parent = getNode(root, segments.slice(0, -1));
  if (!parent || parent.type !== "dir") return null;
  return { parent, name };
}

function cloneRoot(root: VirtualFsNode): VirtualFsNode {
  return JSON.parse(JSON.stringify(root)) as VirtualFsNode;
}

export interface TerminalRunResult {
  state: TerminalState;
  entry: TerminalHistoryEntry;
}

export function runTerminalCommand(
  state: TerminalState,
  rawCommand: string,
): TerminalRunResult {
  const tokens = tokenizeCommand(rawCommand.trim());
  const [cmd, ...args] = tokens;

  if (!cmd) {
    return { state, entry: { command: rawCommand, output: [], isError: false } };
  }

  const root = cloneRoot(state.root);
  let cwd = state.cwd;
  let output: string[] = [];
  let isError = false;

  switch (cmd) {
    case "pwd": {
      output = [cwd];
      break;
    }
    case "whoami": {
      output = ["user"];
      break;
    }
    case "help": {
      output = [
        "Comandos disponibles: pwd, ls [-a], cd <dir>, mkdir [-p] <dir>, touch <archivo>,",
        "cat <archivo>, echo <texto> [> archivo | >> archivo], rm [-r] <ruta>, cp <origen> <destino>,",
        "mv <origen> <destino>, whoami, clear, help.",
      ];
      break;
    }
    case "clear": {
      output = ["__CLEAR__"];
      break;
    }
    case "ls": {
      const showAll = args.some((a) => a === "-a" || a === "-la" || a === "-al");
      const pathArg = args.find((a) => !a.startsWith("-"));
      const segments = resolveSegments(cwd, pathArg ?? ".");
      const node = getNode(root, segments);
      if (!node) {
        output = [`ls: no existe el archivo o directorio: ${pathArg ?? "."}`];
        isError = true;
      } else if (node.type === "file") {
        output = [segments[segments.length - 1] ?? "/"];
      } else {
        const names = Object.keys(node.children ?? {}).sort();
        output = showAll ? names : names.filter((n) => !n.startsWith("."));
      }
      break;
    }
    case "cd": {
      const target = args[0] ?? "/home/user";
      const segments = resolveSegments(cwd, target);
      const node = getNode(root, segments);
      if (!node || node.type !== "dir") {
        output = [`cd: no existe el directorio: ${target}`];
        isError = true;
      } else {
        cwd = segmentsToPath(segments);
      }
      break;
    }
    case "mkdir": {
      const recursive = args.includes("-p");
      const targets = args.filter((a) => a !== "-p");
      if (!targets.length) {
        output = ["mkdir: falta un operando"];
        isError = true;
        break;
      }
      const lines: string[] = [];
      for (const target of targets) {
        const segments = resolveSegments(cwd, target);
        if (recursive) {
          let node = root;
          for (const segment of segments) {
            if (node.type !== "dir") break;
            node.children ??= {};
            node.children[segment] ??= dir();
            node = node.children[segment] as VirtualFsNode;
          }
          continue;
        }
        const result = getParentAndName(root, segments);
        if (!result) {
          lines.push(`mkdir: no se pudo crear '${target}': ruta no válida`);
          isError = true;
          continue;
        }
        if (result.parent.children?.[result.name]) {
          lines.push(`mkdir: no se pudo crear '${target}': ya existe`);
          isError = true;
          continue;
        }
        result.parent.children ??= {};
        result.parent.children[result.name] = dir();
      }
      output = lines;
      break;
    }
    case "touch": {
      if (!args.length) {
        output = ["touch: falta un operando"];
        isError = true;
        break;
      }
      const lines: string[] = [];
      for (const target of args) {
        const segments = resolveSegments(cwd, target);
        const result = getParentAndName(root, segments);
        if (!result) {
          lines.push(`touch: ruta no válida: ${target}`);
          isError = true;
          continue;
        }
        result.parent.children ??= {};
        result.parent.children[result.name] ??= file("");
      }
      output = lines;
      break;
    }
    case "cat": {
      if (!args.length) {
        output = ["cat: falta un operando"];
        isError = true;
        break;
      }
      const lines: string[] = [];
      for (const target of args) {
        const segments = resolveSegments(cwd, target);
        const node = getNode(root, segments);
        if (!node) {
          lines.push(`cat: ${target}: no existe`);
          isError = true;
        } else if (node.type !== "file") {
          lines.push(`cat: ${target}: es un directorio`);
          isError = true;
        } else {
          const content = node.content ?? "";
          const contentLines = content.split("\n");
          if (contentLines[contentLines.length - 1] === "") contentLines.pop();
          lines.push(...contentLines);
        }
      }
      output = lines;
      break;
    }
    case "echo": {
      const redirectIndex = args.findIndex((a) => a === ">" || a === ">>");
      if (redirectIndex === -1) {
        output = [args.join(" ")];
        break;
      }
      const append = args[redirectIndex] === ">>";
      const content = args.slice(0, redirectIndex).join(" ");
      const target = args[redirectIndex + 1];
      if (!target) {
        output = ["echo: falta el archivo destino tras la redirección"];
        isError = true;
        break;
      }
      const segments = resolveSegments(cwd, target);
      const result = getParentAndName(root, segments);
      if (!result) {
        output = [`echo: ruta no válida: ${target}`];
        isError = true;
        break;
      }
      const existing = result.parent.children?.[result.name];
      const previous = existing?.type === "file" ? (existing.content ?? "") : "";
      result.parent.children ??= {};
      result.parent.children[result.name] = file(
        append ? `${previous}${content}\n` : `${content}\n`,
      );
      break;
    }
    case "rm": {
      const recursive = args.some((a) => a === "-r" || a === "-rf" || a === "-fr");
      const targets = args.filter((a) => !a.startsWith("-"));
      if (!targets.length) {
        output = ["rm: falta un operando"];
        isError = true;
        break;
      }
      const lines: string[] = [];
      for (const target of targets) {
        const segments = resolveSegments(cwd, target);
        const result = getParentAndName(root, segments);
        const node = result?.parent.children?.[result.name];
        if (!result || !node) {
          lines.push(`rm: no existe: ${target}`);
          isError = true;
          continue;
        }
        if (node.type === "dir" && !recursive) {
          lines.push(`rm: no se puede eliminar '${target}': es un directorio (usa -r)`);
          isError = true;
          continue;
        }
        delete result.parent.children?.[result.name];
      }
      output = lines;
      break;
    }
    case "cp":
    case "mv": {
      const [src, dest] = args;
      if (!src || !dest) {
        output = [`${cmd}: se requieren origen y destino`];
        isError = true;
        break;
      }
      const srcSegments = resolveSegments(cwd, src);
      const srcNode = getNode(root, srcSegments);
      if (!srcNode) {
        output = [`${cmd}: no existe: ${src}`];
        isError = true;
        break;
      }
      let destSegments = resolveSegments(cwd, dest);
      const destNode = getNode(root, destSegments);
      if (destNode?.type === "dir") {
        destSegments = [...destSegments, srcSegments[srcSegments.length - 1] as string];
      }
      const destResult = getParentAndName(root, destSegments);
      if (!destResult) {
        output = [`${cmd}: destino no válido: ${dest}`];
        isError = true;
        break;
      }
      destResult.parent.children ??= {};
      destResult.parent.children[destResult.name] = JSON.parse(
        JSON.stringify(srcNode),
      ) as VirtualFsNode;
      if (cmd === "mv") {
        const srcResult = getParentAndName(root, srcSegments);
        if (srcResult) delete srcResult.parent.children?.[srcResult.name];
      }
      break;
    }
    default: {
      output = [
        `${cmd}: comando no encontrado. Escribe 'help' para ver los comandos disponibles.`,
      ];
      isError = true;
    }
  }

  return {
    state: { cwd, root },
    entry: { command: rawCommand, output, isError },
  };
}
