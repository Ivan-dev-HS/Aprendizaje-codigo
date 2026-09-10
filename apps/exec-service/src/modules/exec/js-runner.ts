import { Worker } from "node:worker_threads";
import { env } from "../../config/env.js";

export interface JsRunResult {
  outputs: string[];
  errors: string[];
  timedOut: boolean;
  truncated: boolean;
  durationMs: number;
}

const HARD_KILL_GRACE_MS = 500;

/**
 * Código del worker como string plano en vez de un archivo `.ts` aparte
 * cargado por ruta (`new Worker(rutaAlArchivo)`): eso exigiría que ese
 * archivo exista tal cual en el sistema de ficheros de donde corre
 * exec-service, y que algo dentro del propio hilo sepa interpretar
 * TypeScript — cierto en local (tsx registra un loader también para los
 * hilos que lanza), falso en un despliegue serverless empaquetado (el
 * bundler solo incluye lo que se importa estáticamente, nunca una ruta de
 * archivo calculada en runtime). Pasando el código ya en JavaScript puro vía
 * `eval: true` el worker no depende de ningún archivo ni loader externo:
 * funciona igual en local y en un bundle de una sola función.
 *
 * Se ejecuta SIEMPRE dentro de un worker_thread dedicado, nunca en el
 * proceso principal de exec-service ni en el de la API. Además del
 * aislamiento de hilo, el código de usuario corre dentro de un contexto `vm`
 * propio: no tiene acceso a `require`, `process`, `fs`, `child_process` ni a
 * ningún global de Node salvo los que se listan explícitamente en `sandbox`.
 * Ver docs/SECURITY.md §Ejecución de código para el modelo de amenazas
 * completo.
 */
const WORKER_SOURCE = `
const vm = require("node:vm");
const { parentPort, workerData } = require("node:worker_threads");

const { code, timeoutMs, maxOutputBytes } = workerData;

const outputs = [];
const errors = [];
let outputBytes = 0;
let truncated = false;

function safeStringify(value) {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.name + ": " + value.message;
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}

function capture(target, args) {
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
  log: (...args) => capture(outputs, args),
  info: (...args) => capture(outputs, args),
  warn: (...args) => capture(outputs, args),
  error: (...args) => capture(errors, args),
};

// Solo globals seguros y deterministas. Sin require, process, fs, Buffer,
// setInterval (repetición indefinida) ni ningún acceso a red o disco.
// setTimeout se expone porque es habitual en ejemplos didácticos de
// asincronía; como el worker completo se termina a los timeoutMs (ver
// js-runner.ts), un temporizador que no llega a disparar simplemente muere
// con el worker sin efecto alguno.
const sandbox = {
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
  setTimeout: (fn, ms) => setTimeout(fn, Math.min(ms, timeoutMs)),
  clearTimeout,
};

vm.createContext(sandbox);

async function run() {
  let timedOut = false;

  try {
    const script = new vm.Script(code, { filename: "playground.js" });
    script.runInContext(sandbox, { timeout: timeoutMs });
  } catch (err) {
    // Nota: un error lanzado DENTRO del contexto vm pertenece al realm
    // aislado de la sandbox, así que "err instanceof Error" (comparado con
    // el Error del proceso host) da false aunque el objeto tenga la misma
    // forma — es el "cross-realm instanceof" habitual de vm. Por eso aquí
    // se usa duck-typing ("message" in err) y err.code, no instanceof.
    const isErrorLike = typeof err === "object" && err !== null && "message" in err;
    const errCode = isErrorLike ? err.code : undefined;
    const message = isErrorLike ? String(err.message) : String(err);

    if (errCode === "ERR_SCRIPT_EXECUTION_TIMEOUT" || /Script execution timed out/.test(message)) {
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

  parentPort.postMessage({ outputs, errors, timedOut, truncated });
}

void run();
`;

/**
 * Ejecuta código JavaScript de usuario en un worker_thread dedicado y
 * desechable (uno nuevo por request, nunca se reutiliza entre usuarios).
 * Ver docs/SECURITY.md §Ejecución de código para el modelo de amenazas.
 */
export function runJavaScript(code: string): Promise<JsRunResult> {
  const startedAt = Date.now();

  return new Promise((resolve) => {
    const worker = new Worker(WORKER_SOURCE, {
      eval: true,
      workerData: {
        code,
        timeoutMs: env.EXEC_JS_TIMEOUT_MS,
        maxOutputBytes: env.EXEC_MAX_OUTPUT_BYTES,
      },
      resourceLimits: {
        maxOldGenerationSizeMb: env.EXEC_JS_MEMORY_MB,
        maxYoungGenerationSizeMb: Math.max(16, Math.floor(env.EXEC_JS_MEMORY_MB / 4)),
      },
      // El worker no necesita nada del entorno del proceso principal.
      env: {},
    });

    let settled = false;

    const killTimer = setTimeout(() => {
      void worker.terminate();
    }, env.EXEC_JS_TIMEOUT_MS + HARD_KILL_GRACE_MS);

    function finish(result: JsRunResult) {
      if (settled) return;
      settled = true;
      clearTimeout(killTimer);
      void worker.terminate();
      resolve(result);
    }

    worker.once("message", (message: Omit<JsRunResult, "durationMs">) => {
      finish({ ...message, durationMs: Date.now() - startedAt });
    });

    worker.once("error", (err) => {
      finish({
        outputs: [],
        errors: [`Error interno de ejecución: ${err.message}`],
        timedOut: false,
        truncated: false,
        durationMs: Date.now() - startedAt,
      });
    });

    worker.once("exit", (code) => {
      if (code !== 0 && !settled) {
        finish({
          outputs: [],
          errors: [
            "El proceso de ejecución se detuvo inesperadamente (posible límite de memoria).",
          ],
          timedOut: false,
          truncated: false,
          durationMs: Date.now() - startedAt,
        });
      }
    });
  });
}
