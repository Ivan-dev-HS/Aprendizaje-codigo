import vm from "node:vm";
import { parentPort, workerData } from "node:worker_threads";

/**
 * Este script se ejecuta SIEMPRE dentro de un worker_thread dedicado (ver
 * js-runner.ts), nunca en el proceso principal de exec-service ni en el de
 * la API. Además del aislamiento de hilo, el código de usuario corre dentro
 * de un contexto `vm` propio: no tiene acceso a `require`, `process`, `fs`,
 * `child_process` ni a ningún global de Node salvo los que se listan
 * explícitamente en `sandbox` más abajo.
 */

interface RunnerInput {
  code: string;
  timeoutMs: number;
  maxOutputBytes: number;
}

interface RunnerOutput {
  outputs: string[];
  errors: string[];
  timedOut: boolean;
  truncated: boolean;
}

const { code, timeoutMs, maxOutputBytes } = workerData as RunnerInput;

const outputs: string[] = [];
const errors: string[] = [];
let outputBytes = 0;
let truncated = false;

function safeStringify(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}

function capture(target: string[], args: unknown[]): void {
  if (truncated) return;
  const line = args.map(safeStringify).join(" ");
  const bytes = Buffer.byteLength(line, "utf8");
  if (outputBytes + bytes > maxOutputBytes) {
    target.push("[output truncado: se alcanzó el límite de tamaño]");
    truncated = true;
    return;
  }
  outputBytes += bytes;
  target.push(line);
}

const sandboxConsole = {
  log: (...args: unknown[]) => capture(outputs, args),
  info: (...args: unknown[]) => capture(outputs, args),
  warn: (...args: unknown[]) => capture(outputs, args),
  error: (...args: unknown[]) => capture(errors, args),
};

/**
 * Solo globals seguros y deterministas. Sin `require`, `process`, `fs`,
 * `Buffer`, `setInterval` (repetición indefinida) ni ningún acceso a red o
 * disco. `setTimeout` se expone porque es habitual en ejemplos didácticos de
 * asincronía (sección 19/asincronía de SPEC.md); como el worker completo se
 * termina a los `timeoutMs` (ver js-runner.ts), un temporizador que no llega
 * a disparar simplemente muere con el worker sin efecto alguno.
 */
const sandbox: Record<string, unknown> = {
  console: sandboxConsole,
  Math,
  JSON,
  Array,
  Object,
  String,
  Number,
  Boolean,
  Date,
  RegExp,
  Error,
  TypeError,
  RangeError,
  Symbol,
  Map,
  Set,
  Promise,
  setTimeout: (fn: () => void, ms: number) => setTimeout(fn, Math.min(ms, timeoutMs)),
  clearTimeout,
};

vm.createContext(sandbox);

async function run(): Promise<void> {
  let timedOut = false;

  try {
    const script = new vm.Script(code, { filename: "playground.js" });
    script.runInContext(sandbox, { timeout: timeoutMs });
  } catch (err) {
    // Nota: un error lanzado DENTRO del contexto `vm` pertenece al realm
    // aislado de la sandbox, así que `err instanceof Error` (comparado con el
    // `Error` del proceso host) da `false` aunque el objeto tenga la misma
    // forma — es el "cross-realm instanceof" habitual de `vm`. Por eso aquí
    // se usa duck-typing (`"message" in err`) y `err.code`, no `instanceof`.
    const isErrorLike = typeof err === "object" && err !== null && "message" in err;
    const code = isErrorLike ? (err as { code?: string }).code : undefined;
    const message = isErrorLike
      ? String((err as { message: unknown }).message)
      : String(err);

    if (
      code === "ERR_SCRIPT_EXECUTION_TIMEOUT" ||
      /Script execution timed out/.test(message)
    ) {
      timedOut = true;
      errors.push("El código tardó demasiado en ejecutarse (timeout).");
    } else {
      errors.push(message);
    }
  }

  // Ventana breve para permitir que microtasks/timers cortos ya encolados
  // (p. ej. un await Promise.resolve() o un setTimeout(fn, 0)) se resuelvan
  // y su console.log se capture, sin extender indefinidamente la ejecución.
  await new Promise((resolve) => setTimeout(resolve, Math.min(200, timeoutMs)));

  const result: RunnerOutput = { outputs, errors, timedOut, truncated };
  parentPort?.postMessage(result);
}

void run();
